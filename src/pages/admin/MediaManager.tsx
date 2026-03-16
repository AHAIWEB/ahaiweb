import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MediaManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">মিডিয়া ম্যানেজার</h2>

      {isLoading ? (
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      ) : media && media.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {media.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="aspect-square bg-muted relative">
                <img src={item.file_url} alt={item.caption || ""} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(item.id)}>
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
            কোনো মিডিয়া ফাইল নেই। পোস্ট তৈরির সময় ছবি আপলোড করুন।
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MediaManager;
