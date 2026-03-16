import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Link2 } from "lucide-react";

const UrlPost = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data || [];
    },
  });

  const handleSubmit = async (status: "draft" | "published") => {
    if (!title.trim() || !sourceUrl.trim() || !user) return;
    setLoading(true);

    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, "-") + "-" + Date.now();

      await supabase.from("posts").insert({
        user_id: user.id,
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt: content.trim().substring(0, 150),
        featured_image: imageUrl || null,
        source_url: sourceUrl.trim(),
        source_name: sourceName.trim() || null,
        category_id: categoryId || null,
        post_type: "url" as const,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      });

      toast({ title: "সফল!", description: "URL পোস্ট তৈরি হয়েছে" });
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
          <Input placeholder="শিরোনাম" value={title} onChange={(e) => setTitle(e.target.value)} />

          <Input placeholder="সোর্স URL (https://...)" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />

          <Input placeholder="সোর্সের নাম (যেমন: প্রথম আলো)" value={sourceName} onChange={(e) => setSourceName(e.target.value)} />

          <Input placeholder="ছবির URL (ঐচ্ছিক)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />

          {imageUrl && (
            <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
            </div>
          )}

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
