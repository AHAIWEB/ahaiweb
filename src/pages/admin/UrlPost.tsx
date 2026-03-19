import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link2, Loader2 } from "lucide-react";
import PostTagLocationPicker from "@/components/PostTagLocationPicker";

const UrlPost = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedUpazila, setSelectedUpazila] = useState("");

  // Load post data for editing
  useEffect(() => {
    if (!editId) return;
    const loadPost = async () => {
      const { data: post } = await supabase.from("posts").select("*").eq("id", editId).single();
      if (post) {
        setTitle(post.title);
        setContent(post.content || "");
        setSourceUrl(post.source_url || "");
        setSourceName(post.source_name || "");
        setImageUrl(post.featured_image || "");
        if (post.category_id) setSelectedCategories([post.category_id]);
      }
      const { data: tags } = await supabase.from("post_tags").select("tag_id").eq("post_id", editId);
      if (tags) setSelectedTags(tags.map((t) => t.tag_id));
      const { data: loc } = await supabase.from("post_locations").select("*").eq("post_id", editId).single();
      if (loc) {
        setSelectedDivision(loc.division_id || "");
        setSelectedDistrict(loc.district_id || "");
        setSelectedUpazila(loc.upazila_id || "");
      }
    };
    loadPost();
  }, [editId]);

  const fetchMeta = async (url: string) => {
    if (!url.startsWith("http")) return;
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-url-meta", { body: { url } });
      if (!error && data) {
        if (data.title && !title) setTitle(data.title);
        if (data.image && !imageUrl) setImageUrl(data.image);
        // Prefer full content over description
        if (data.content && !content) setContent(data.content);
        else if (data.description && !content) setContent(data.description);
        if (data.siteName && !sourceName) setSourceName(data.siteName);
        toast({ title: "ফেচ সফল!", description: "মেটাডাটা আনা হয়েছে" });
      }
    } catch {
      toast({ title: "ফেচ ব্যর্থ", variant: "destructive" });
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (status: "draft" | "published") => {
    if (!title.trim() || !sourceUrl.trim() || !user) return;
    setLoading(true);

    try {
      let postId = editId;

      if (editId) {
        const { error } = await supabase.from("posts").update({
          title: title.trim(),
          content: content.trim(),
          excerpt: content.trim().substring(0, 150),
          featured_image: imageUrl || null,
          source_url: sourceUrl.trim(),
          source_name: sourceName.trim() || null,
          category_id: selectedCategories[0] || null,
          status,
          published_at: status === "published" ? new Date().toISOString() : null,
        }).eq("id", editId);
        if (error) throw error;

        await supabase.from("post_tags").delete().eq("post_id", editId);
        await supabase.from("post_categories").delete().eq("post_id", editId);
        await supabase.from("post_locations").delete().eq("post_id", editId);
      } else {
        const slug = title.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, "-") + "-" + Date.now();
        const { data: post, error: postError } = await supabase.from("posts").insert({
          user_id: user.id,
          title: title.trim(),
          slug,
          content: content.trim(),
          excerpt: content.trim().substring(0, 150),
          featured_image: imageUrl || null,
          source_url: sourceUrl.trim(),
          source_name: sourceName.trim() || null,
          category_id: selectedCategories[0] || null,
          post_type: "url" as const,
          status,
          published_at: status === "published" ? new Date().toISOString() : null,
        }).select().single();
        if (postError) throw postError;
        postId = post.id;
      }

      if (selectedCategories.length > 0 && postId) {
        await supabase.from("post_categories").insert(
          selectedCategories.map((catId) => ({ post_id: postId!, category_id: catId }))
        );
      }

      if (selectedTags.length > 0 && postId) {
        await supabase.from("post_tags").insert(
          selectedTags.map((tagId) => ({ post_id: postId!, tag_id: tagId }))
        );
      }

      if (selectedDivision && postId) {
        await supabase.from("post_locations").insert({
          post_id: postId,
          division_id: selectedDivision || null,
          district_id: selectedDistrict || null,
          upazila_id: selectedUpazila || null,
        });
      }

      toast({ title: "সফল!", description: editId ? "পোস্ট আপডেট হয়েছে" : "URL পোস্ট তৈরি হয়েছে" });
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
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Link2 className="h-6 w-6" /> URL কুইক পোস্ট
      </h2>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex gap-2">
            <Input placeholder="সোর্স URL (https://...)" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className="flex-1" />
            <Button type="button" variant="secondary" disabled={fetching || !sourceUrl.startsWith("http")} onClick={() => fetchMeta(sourceUrl)}>
              {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "ফেচ"}
            </Button>
          </div>

          {fetching && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> URL থেকে তথ্য আনা হচ্ছে...
            </p>
          )}

          <Input placeholder="শিরোনাম" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="সোর্সের নাম (যেমন: প্রথম আলো)" value={sourceName} onChange={(e) => setSourceName(e.target.value)} />
          <Input placeholder="ছবির URL (ঐচ্ছিক)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />

          {imageUrl && (
            <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
            </div>
          )}

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

          <textarea
            placeholder="সম্পূর্ণ কনটেন্ট (ঐচ্ছিক)"
            rows={5}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button onClick={() => handleSubmit("draft")} variant="secondary" disabled={loading || !title.trim() || !sourceUrl.trim()}>
              ড্রাফট সেভ
            </Button>
            <Button onClick={() => handleSubmit("published")} disabled={loading || !title.trim() || !sourceUrl.trim()}>
              প্রকাশ করুন
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UrlPost;
