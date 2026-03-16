import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ImagePlus, X } from "lucide-react";

const QuickPost = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data || [];
    },
  });

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages((prev) => [...prev, ...files]);
      setCaptions((prev) => [...prev, ...files.map(() => "")]);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setCaptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (status: "draft" | "published") => {
    if (!title.trim() || !user) return;
    setLoading(true);

    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();

      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          title: title.trim(),
          slug,
          content: content.trim(),
          excerpt: content.trim().substring(0, 150),
          category_id: categoryId || null,
          post_type: "quick" as const,
          status,
          published_at: status === "published" ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (postError) throw postError;

      // Upload images
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const filePath = `${user.id}/${post.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("media").upload(filePath, file);

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
          await supabase.from("media").insert({
            user_id: user.id,
            post_id: post.id,
            file_url: urlData.publicUrl,
            file_name: file.name,
            caption: captions[i] || null,
            sort_order: i,
          });

          // Set first image as featured
          if (i === 0) {
            await supabase.from("posts").update({ featured_image: urlData.publicUrl }).eq("id", post.id);
          }
        }
      }

      toast({ title: "সফল!", description: status === "published" ? "পোস্ট প্রকাশিত হয়েছে" : "ড্রাফট সেভ হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      navigate("/admin/posts");
    } catch (err: any) {
      toast({ title: "ত্রুটি", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">কুইক পোস্ট</h2>

      <Card>
        <CardContent className="p-5 space-y-4">
          <Input placeholder="শিরোনাম" value={title} onChange={(e) => setTitle(e.target.value)} />

          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger><SelectValue placeholder="লেবেল নির্বাচন করুন" /></SelectTrigger>
            <SelectContent>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="কনটেন্ট লিখুন..."
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* Image upload */}
          <div>
            <label className="text-sm font-medium mb-2 block">ছবি যোগ করুন</label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative w-24 h-24">
                  <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                  <Input
                    placeholder="ক্যাপশন"
                    className="mt-1 h-6 text-xs"
                    value={captions[i]}
                    onChange={(e) => {
                      const newCaptions = [...captions];
                      newCaptions[i] = e.target.value;
                      setCaptions(newCaptions);
                    }}
                  />
                </div>
              ))}
              <label className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={() => handleSubmit("draft")} variant="secondary" disabled={loading || !title.trim()}>
              ড্রাফট সেভ
            </Button>
            <Button onClick={() => handleSubmit("published")} disabled={loading || !title.trim()}>
              প্রকাশ করুন
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickPost;
