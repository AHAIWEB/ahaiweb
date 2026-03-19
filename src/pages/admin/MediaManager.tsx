import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Upload, Loader2, ChevronLeft, ChevronRight, X, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const MediaManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: media, isLoading } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("এই ফাইল মুছে ফেলতে চান?")) return;
    const { error } = await supabase.from("media").delete().eq("id", id);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      toast({ title: "মুছে ফেলা হয়েছে" });
    }
  };

  const handleMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;
    setUploading(true);
    let count = 0;
    for (const file of Array.from(files)) {
      const filePath = `${user.id}/gallery/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(filePath, file);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
        await supabase.from("media").insert({
          user_id: user.id,
          file_url: urlData.publicUrl,
          file_name: file.name,
          caption: null,
          sort_order: 0,
        });
        count++;
      }
    }
    setUploading(false);
    queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    toast({ title: `${count}টি ছবি আপলোড হয়েছে` });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevSlide = () => {
    if (lightboxIndex !== null && media) {
      setLightboxIndex(lightboxIndex === 0 ? media.length - 1 : lightboxIndex - 1);
    }
  };
  const nextSlide = () => {
    if (lightboxIndex !== null && media) {
      setLightboxIndex(lightboxIndex === media.length - 1 ? 0 : lightboxIndex + 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">মিডিয়া ম্যানেজার</h2>
        <div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleMultiUpload} />
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
            ছবি আপলোড
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      ) : media && media.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {media.map((item, index) => (
            <Card key={item.id} className="overflow-hidden group cursor-pointer" onClick={() => openLightbox(index)}>
              <div className="aspect-square bg-muted relative">
                <img src={item.file_url} alt={item.caption || ""} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {item.caption && (
                <CardContent className="p-2">
                  <p className="text-xs text-muted-foreground truncate">{item.caption}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
            কোনো মিডিয়া ফাইল নেই। উপরের বাটনে ক্লিক করে ছবি আপলোড করুন।
          </CardContent>
        </Card>
      )}

      {/* Lightbox Slider */}
      <Dialog open={lightboxIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-0">
          {lightboxIndex !== null && media && media[lightboxIndex] && (
            <div className="relative flex items-center justify-center min-h-[60vh]">
              <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10 h-10 w-10" onClick={prevSlide}>
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <img src={media[lightboxIndex].file_url} alt={media[lightboxIndex].caption || ""} className="max-h-[80vh] max-w-full object-contain" />
              <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10 h-10 w-10" onClick={nextSlide}>
                <ChevronRight className="h-6 w-6" />
              </Button>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                {media[lightboxIndex].caption && (
                  <p className="text-white text-sm mb-1">{media[lightboxIndex].caption}</p>
                )}
                <p className="text-white/50 text-xs">{lightboxIndex + 1} / {media.length}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaManager;
