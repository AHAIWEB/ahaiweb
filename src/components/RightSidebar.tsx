import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Hash, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const RightSidebar = () => {
  const { data: tags } = useQuery({
    queryKey: ["public-tags"],
    queryFn: async () => {
      const { data } = await supabase.from("tags").select("*").order("name");
      return data || [];
    },
  });

  const { data: divisions } = useQuery({
    queryKey: ["public-divisions"],
    queryFn: async () => {
      const { data } = await supabase.from("divisions").select("*").order("bn_name");
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
        .from("posts")
        .select("id, title, featured_image, slug")
        .eq("status", "published")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  return (
    <div className="space-y-4">
      {/* ফিচার্ড */}
      {featuredPosts && featuredPosts.length > 0 && (
        <Card className="news-card">
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
      )}

      {/* ম্যাপ ও বিভাগ */}
      <Card className="news-card">
        <CardHeader className="pb-2">
          <CardTitle className="section-title text-base !mb-0 flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> বিভাগ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-1.5">
            {divisions?.map((d) => (
              <div
                key={d.id}
                className="text-xs px-2.5 py-1.5 rounded-md bg-muted/60 hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors text-center font-medium"
              >
                {d.bn_name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* লেবেল */}
      <Card className="news-card">
        <CardHeader className="pb-2">
          <CardTitle className="section-title text-base !mb-0 flex items-center gap-1.5">
            <Tag className="h-4 w-4" /> লেবেল
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {categories?.map((cat) => (
              <Badge
                key={cat.id}
                className="text-xs cursor-pointer hover:opacity-80 transition-opacity border-0"
                style={{
                  backgroundColor: cat.color ? `${cat.color}20` : undefined,
                  color: cat.color || undefined,
                  border: `1px solid ${cat.color || 'hsl(var(--border))'}`,
                }}
              >
                {cat.icon} {cat.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ট্যাগ ক্লাউড */}
      {tags && tags.length > 0 && (
        <Card className="news-card">
          <CardHeader className="pb-2">
            <CardTitle className="section-title text-base !mb-0 flex items-center gap-1.5">
              <Hash className="h-4 w-4" /> ট্যাগ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, i) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-accent transition-colors"
                  style={{ fontSize: `${Math.max(10, 13 - i * 0.3)}px` }}
                >
                  #{tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RightSidebar;
