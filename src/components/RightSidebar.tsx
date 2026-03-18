import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hash, Tag, Users, PenLine, Share2, Facebook, Twitter, Linkedin, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import LocationMapWidget from "./LocationMapWidget";

const RightSidebar = () => {
  const { toast } = useToast();

  const { data: siteSections } = useQuery({
    queryKey: ["site-sections-right"],
    queryFn: async () => {
      const { data } = await supabase.from("site_sections").select("*").eq("zone" as any, "right_sidebar").order("sort_order");
      return (data as any[]) || [];
    },
  });

  const { data: tags } = useQuery({
    queryKey: ["public-tags"],
    queryFn: async () => {
      const { data } = await supabase.from("tags").select("*").order("name");
      return data || [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["public-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data || [];
    },
  });

  const { data: featuredPosts } = useQuery({
    queryKey: ["sidebar-featured"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts").select("id, title, featured_image, slug")
        .eq("status", "published").eq("is_featured", true)
        .order("created_at", { ascending: false }).limit(3);
      return data || [];
    },
  });

  const { data: peoplePosts } = useQuery({
    queryKey: ["sidebar-people"],
    queryFn: async () => {
      const { data: cat } = await supabase.from("categories").select("id").or("slug.eq.পিপল,name.ilike.%পিপল%").limit(1);
      if (!cat || cat.length === 0) return [];
      const { data } = await supabase
        .from("posts").select("id, title, featured_image, excerpt, slug")
        .eq("status", "published").eq("category_id", cat[0].id)
        .order("created_at", { ascending: false }).limit(4);
      return data || [];
    },
  });

  const { data: columnPosts } = useQuery({
    queryKey: ["sidebar-column"],
    queryFn: async () => {
      const { data: cat } = await supabase.from("categories").select("id").or("slug.eq.কলাম,name.ilike.%কলাম%").limit(1);
      if (!cat || cat.length === 0) return [];
      const { data } = await supabase
        .from("posts").select("id, title, excerpt, slug")
        .eq("status", "published").eq("category_id", cat[0].id)
        .order("created_at", { ascending: false }).limit(4);
      return data || [];
    },
  });

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = "AHAiWEB - আমার ওয়েব";
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "লিংক কপি হয়েছে!" });
  };

  const visibleSections = siteSections?.filter((s: any) => s.is_visible) || [];
  const sectionKeys = visibleSections.length > 0
    ? visibleSections.map((s: any) => s.section_key)
    : ["share", "featured", "people", "column", "location_map", "right_labels", "tag_cloud"];

  const renderWidget = (key: string) => {
    switch (key) {
      case "share":
        return (
          <Card className="news-card" key="share">
            <CardHeader className="pb-2">
              <CardTitle className="section-title text-base !mb-0 flex items-center gap-1.5">
                <Share2 className="h-4 w-4" /> শেয়ার করুন
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-colors text-xs font-medium">
                  <Facebook className="h-3.5 w-3.5" /> Facebook
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white transition-colors text-xs font-medium">
                  <Twitter className="h-3.5 w-3.5" /> Twitter
                </a>
                <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-colors text-xs font-medium">
                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                </a>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs gap-1.5" onClick={copyLink}>
                <Copy className="h-3 w-3" /> লিংক কপি করুন
              </Button>
            </CardContent>
          </Card>
        );

      case "featured":
        return featuredPosts && featuredPosts.length > 0 ? (
          <Card className="news-card" key="featured">
            <CardHeader className="pb-2">
              <CardTitle className="section-title text-base !mb-0">⭐ ফিচার্ড</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {featuredPosts.map((p) => (
                <div key={p.id} className="group cursor-pointer flex gap-2.5">
                  {p.featured_image && (
                    <div className="w-14 h-14 rounded-md bg-muted shrink-0 overflow-hidden">
                      <img src={p.featured_image} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors line-clamp-3">{p.title}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null;

      case "people":
        return peoplePosts && peoplePosts.length > 0 ? (
          <Card className="news-card" key="people">
            <CardHeader className="pb-2">
              <CardTitle className="section-title text-base !mb-0 flex items-center gap-1.5">
                <Users className="h-4 w-4" /> পিপল
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {peoplePosts.map((p) => (
                <div key={p.id} className="group cursor-pointer flex gap-2.5 items-center">
                  {p.featured_image ? (
                    <div className="w-10 h-10 rounded-full bg-muted shrink-0 overflow-hidden ring-2 ring-border">
                      <img src={p.featured_image} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 shrink-0 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors line-clamp-2">{p.title}</p>
                    {p.excerpt && <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{p.excerpt}</p>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null;

      case "column":
        return columnPosts && columnPosts.length > 0 ? (
          <Card className="news-card" key="column">
            <CardHeader className="pb-2">
              <CardTitle className="section-title text-base !mb-0 flex items-center gap-1.5">
                <PenLine className="h-4 w-4" /> কলাম
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {columnPosts.map((p) => (
                <div key={p.id} className="group cursor-pointer border-l-2 border-primary/30 hover:border-primary pl-3 transition-colors">
                  <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors line-clamp-2">{p.title}</p>
                  {p.excerpt && <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{p.excerpt}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null;

      case "location_map":
        return <LocationMapWidget key="location_map" />;

      case "right_labels":
        return (
          <Card className="news-card" key="right_labels">
            <CardHeader className="pb-2">
              <CardTitle className="section-title text-base !mb-0 flex items-center gap-1.5">
                <Tag className="h-4 w-4" /> লেবেল
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {categories?.map((cat) => (
                  <Badge key={cat.id}
                    className="text-xs cursor-pointer hover:opacity-80 transition-opacity border-0"
                    style={{
                      backgroundColor: cat.color ? `${cat.color}20` : undefined,
                      color: cat.color || undefined,
                      border: `1px solid ${cat.color || 'hsl(var(--border))'}`,
                    }}>
                    {cat.icon} {cat.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "tag_cloud":
        return tags && tags.length > 0 ? (
          <Card className="news-card" key="tag_cloud">
            <CardHeader className="pb-2">
              <CardTitle className="section-title text-base !mb-0 flex items-center gap-1.5">
                <Hash className="h-4 w-4" /> ট্যাগ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, i) => (
                  <Badge key={tag.id} variant="outline"
                    className="text-xs cursor-pointer hover:bg-accent transition-colors"
                    style={{ fontSize: `${Math.max(10, 13 - i * 0.3)}px` }}>
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null;

      default:
        const section = visibleSections.find((s: any) => s.section_key === key);
        if (section?.config?.type === "ad" && section?.config?.ad_code) {
          return <div key={key} className="w-full" dangerouslySetInnerHTML={{ __html: section.config.ad_code }} />;
        }
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {sectionKeys.map((key: string) => renderWidget(key))}
    </div>
  );
};

export default RightSidebar;
