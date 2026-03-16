import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ImagePlus, X, Bold, Italic, Heading1, Heading2, List, Quote } from "lucide-react";

const EditorPost = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState("");
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

  const handleFeaturedImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      setFeaturedPreview(URL.createObjectURL(file));
    }
  };

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages((prev) => [...prev, ...files]);
      setCaptions((prev) => [...prev, ...files.map(() => "")]);
    }
  };

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = document.querySelector<HTMLTextAreaElement>("#editor-content");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const newContent = content.substring(0, start) + prefix + selected + suffix + content.substring(end);
    setContent(newContent);
  };

  const handleSubmit = async (status: "draft" | "published") => {
    if (!title.trim() || !user) return;
    setLoading(true);

    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, "-") + "-" + Date.now();

      let featuredImageUrl = "";

      if (featuredImage) {
        const filePath = `${user.id}/featured/${Date.now()}-${featuredImage.name}`;
        const { error } = await supabase.storage.from("media").upload(filePath, featuredImage);
        if (!error) {
          const { data } = supabase.storage.from("media").getPublicUrl(filePath);
          featuredImageUrl = data.publicUrl;
        }
      }

      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          title: title.trim(),
          slug,
          content: content.trim(),
          excerpt: excerpt.trim() || content.trim().substring(0, 150),
          featured_image: featuredImageUrl || null,
          category_id: categoryId || null,
          post_type: "editor" as const,
          status,
          published_at: status === "published" ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (postError) throw postError;

      // Upload additional images
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
        }
      }

      toast({ title: "সফল!", description: status === "published" ? "পোস্ট প্রকাশিত!" : "ড্রাফট সেভ!" });
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      navigate("/admin/posts");
    } catch (err: any) {
      toast({ title: "ত্রুটি", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">এডিটর পোস্ট</h2>

      <Card>
        <CardContent className="p-5 space-y-4">
          <Input placeholder="শিরোনাম" className="text-lg font-semibold" value={title} onChange={(e) => setTitle(e.target.value)} />

          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger><SelectValue placeholder="লেবেল নির্বাচন করুন" /></SelectTrigger>
            <SelectContent>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Featured image */}
          <div>
            <label className="text-sm font-medium mb-2 block">ফিচার্ড ছবি</label>
            {featuredPreview ? (
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img src={featuredPreview} alt="" className="w-full h-full object-cover" />
                <button onClick={() => { setFeaturedImage(null); setFeaturedPreview(""); }}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="aspect-video border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">ছবি আপলোড করুন</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFeaturedImage} />
              </label>
            )}
          </div>

          {/* Formatting toolbar */}
          <div className="flex gap-1 border border-border rounded-lg p-1">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => insertFormatting("**", "**")}><Bold className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => insertFormatting("*", "*")}><Italic className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => insertFormatting("# ")}><Heading1 className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => insertFormatting("## ")}><Heading2 className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => insertFormatting("- ")}><List className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => insertFormatting("> ")}><Quote className="h-4 w-4" /></Button>
          </div>

          <Textarea
            id="editor-content"
            placeholder="কনটেন্ট লিখুন... (মার্কডাউন সাপোর্টেড)"
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="font-mono text-sm"
          />

          <Input placeholder="সারসংক্ষেপ (ঐচ্ছিক)" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />

          {/* Additional images */}
          <div>
            <label className="text-sm font-medium mb-2 block">অতিরিক্ত ছবি</label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(img)} alt="" className="w-20 h-20 object-cover rounded-lg" />
                  <button onClick={() => { setImages(p => p.filter((_, j) => j !== i)); setCaptions(p => p.filter((_, j) => j !== i)); }}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                  <Input placeholder="ক্যাপশন" className="mt-1 h-6 text-xs w-20"
                    value={captions[i]} onChange={(e) => { const c = [...captions]; c[i] = e.target.value; setCaptions(c); }} />
                </div>
              ))}
              <label className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary">
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={() => handleSubmit("draft")} variant="secondary" disabled={loading || !title.trim()}>ড্রাফট সেভ</Button>
            <Button onClick={() => handleSubmit("published")} disabled={loading || !title.trim()}>প্রকাশ করুন</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditorPost;
