import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Heart, Eye, ExternalLink, Loader2 } from "lucide-react";

const PostDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["post-detail", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("*, categories(name, icon, color), post_categories(categories(name, icon, color)), post_tags(tags(name, slug)), post_locations(divisions(bn_name), districts(bn_name))")
        .eq("slug", slug!)
        .single();
      return data as any;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">পোস্ট পাওয়া যায়নি</p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link to="/"><ArrowLeft className="h-3.5 w-3.5 mr-1" /> হোমে ফিরুন</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" }); } catch { return d; }
  };

  const allCategories = [
    ...(post.categories ? [post.categories] : []),
    ...(post.post_categories?.map((pc: any) => pc.categories).filter(Boolean) || []),
  ];

  const tags = post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || [];
  const location = post.post_locations?.[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <article className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" asChild>
          <Link to="/"><ArrowLeft className="h-3.5 w-3.5" /> হোমে ফিরুন</Link>
        </Button>

        {post.featured_image && (
          <div className="aspect-[16/9] rounded-xl overflow-hidden bg-muted">
            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDate(post.created_at)}</span>
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {post.views || 0} ভিউ</span>
            <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {post.likes || 0}</span>
            {location?.divisions?.bn_name && (
              <span>📍 {location.divisions.bn_name}{location.districts?.bn_name ? `, ${location.districts.bn_name}` : ""}</span>
            )}
          </div>

          {allCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allCategories.map((cat: any, i: number) => (
                <Badge key={i} variant="outline" className="text-xs" style={{
                  borderColor: cat.color || undefined, color: cat.color || undefined,
                }}>
                  {cat.icon} {cat.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {post.source_url && (
          <Card className="border-dashed">
            <CardContent className="py-3 flex items-center justify-between">
              <div className="text-sm">
                <span className="text-muted-foreground">সোর্স: </span>
                <span className="font-medium">{post.source_name || "লিংক"}</span>
              </div>
              <a href={post.source_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <ExternalLink className="h-3 w-3" /> মূল লিংক
                </Button>
              </a>
            </CardContent>
          </Card>
        )}

        {post.content && (
          <div className="prose prose-sm max-w-none dark:prose-invert leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }} />
        )}

        {!post.content && post.excerpt && (
          <p className="text-muted-foreground leading-relaxed">{post.excerpt}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground mr-1">ট্যাগ:</span>
            {tags.map((tag: any) => (
              <Badge key={tag.slug} variant="secondary" className="text-xs">#{tag.name}</Badge>
            ))}
          </div>
        )}
      </article>

      <footer className="border-t border-border mt-12 py-6 text-center text-sm text-muted-foreground">
        <p>© ২০২৬ AHAiWEB — সর্বস্বত্ব সংরক্ষিত</p>
      </footer>
    </div>
  );
};

export default PostDetail;
