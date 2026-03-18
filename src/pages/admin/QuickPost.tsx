import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, Link2 } from "lucide-react";
import PostTagLocationPicker from "@/components/PostTagLocationPicker";
import MultiImageUploader, { ImageItem } from "@/components/MultiImageUploader";

const QuickPost = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedUpazila, setSelectedUpazila] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [fetching, setFetching] = useState(false);

  const fetchFromUrl = async () => {
    if (!sourceUrl.startsWith("http")) return;
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-url-meta", { body: { url: sourceUrl } });
      if (!error && data) {
        if (data.title && !title) setTitle(data.title);
        if (data.content && !content) setContent(data.content);
        else if (data.description && !content) setContent(data.description);
        if (data.image) {
          setImages(prev => prev.length === 0 ? [{ id: Date.now().toString(), type: "url" as const, url: data.image, caption: "", preview: data.image }] : prev);
        }
        toast({ title: "ফেচ সফল!", description: "URL থেকে কন্টেন্ট আনা হয়েছে" });
      }
    } catch {
      toast({ title: "ফেচ ব্যর্থ", variant: "destructive" });
    } finally {
      setFetching(false);
    }
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
          category_id: selectedCategories[0] || null,
          post_type: "quick" as const,
          status,
          published_at: status === "published" ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (postError) throw postError;

      if (selectedCategories.length > 0) {
        await supabase.from("post_categories").insert(
          selectedCategories.map((catId) => ({ post_id: post.id, category_id: catId }))
        );
      }

      if (selectedTags.length > 0) {
        await supabase.from("post_tags").insert(
          selectedTags.map((tagId) => ({ post_id: post.id, tag_id: tagId }))
        );
      }

      if (selectedDivision) {
        await supabase.from("post_locations").insert({
          post_id: post.id,
          division_id: selectedDivision || null,
          district_id: selectedDistrict || null,
          upazila_id: selectedUpazila || null,
        });
      }

      // Upload images (file or URL)
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        let fileUrl = "";

        if (img.type === "file" && img.file) {
          const filePath = `${user.id}/${post.id}/${Date.now()}-${img.file.name}`;
          const { error: uploadError } = await supabase.storage.from("media").upload(filePath, img.file);
          if (!uploadError) {
            const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
            fileUrl = urlData.publicUrl;
          }
        } else if (img.type === "url" && img.url) {
          fileUrl = img.url;
        }

        if (fileUrl) {
          await supabase.from("media").insert({
            user_id: user.id,
            post_id: post.id,
            file_url: fileUrl,
            file_name: img.file?.name || "url-image",
            caption: img.caption || null,
            sort_order: i,
          });

          if (i === 0) {
            await supabase.from("posts").update({ featured_image: fileUrl }).eq("id", post.id);
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
          <div className="flex gap-2">
            <Input placeholder="URL থেকে কন্টেন্ট আনুন (ঐচ্ছিক)" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className="flex-1" />
            <Button type="button" variant="secondary" size="sm" disabled={fetching || !sourceUrl.startsWith("http")} onClick={fetchFromUrl}>
              {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Link2 className="h-4 w-4 mr-1" /> ফেচ</>}
            </Button>
          </div>

          <Input placeholder="শিরোনাম" value={title} onChange={(e) => setTitle(e.target.value)} />

          <PostTagLocationPicker
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
            selectedDivision={selectedDivision}
            onDivisionChange={setSelectedDivision}
            selectedDistrict={selectedDistrict}
            onDistrictChange={setSelectedDistrict}
            selectedUpazila={selectedUpazila}
            onUpazilaChange={setSelectedUpazila}
          />

          <Textarea
            placeholder="কনটেন্ট লিখুন..."
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <MultiImageUploader images={images} onChange={setImages} />

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
