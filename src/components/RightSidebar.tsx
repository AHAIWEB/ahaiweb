import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, PenTool } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="space-y-4">
      {/* People & Writers Tabs */}
      <Card className="news-card">
        <CardHeader className="pb-2">
          <CardTitle className="section-title text-base !mb-0">কমিউনিটি</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="people" className="w-full">
            <TabsList className="w-full grid grid-cols-2 h-8">
              <TabsTrigger value="people" className="text-xs gap-1">
                <Users className="h-3 w-3" /> পিপল
              </TabsTrigger>
              <TabsTrigger value="writers" className="text-xs gap-1">
                <PenTool className="h-3 w-3" /> কলম
              </TabsTrigger>
            </TabsList>

            <TabsContent value="people" className="mt-3 space-y-3">
              {["রাফি আহমেদ", "সাবিনা ইয়াসমিন", "করিম উদ্দিন"].map((name, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-muted">{name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">ব্লগার</p>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="writers" className="mt-3 space-y-3">
              {["জসীম উদ্দীন", "হুমায়ূন আহমেদ", "সেলিনা হোসেন"].map((name, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-accent text-accent-foreground">{name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">লেখক</p>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Map + Labels + Tags */}
      <Card className="news-card">
        <CardHeader className="pb-2">
          <CardTitle className="section-title text-base !mb-0">🗺️ ম্যাপ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">
            🗺️ বাংলাদেশ ম্যাপ
          </div>

          {/* Divisions */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">বিভাগ</p>
            <div className="flex flex-wrap gap-1.5">
              {divisions?.map((d) => (
                <Badge key={d.id} variant="outline" className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                  {d.bn_name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Labels */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">লেবেল</p>
            <div className="flex flex-wrap gap-1.5">
              {categories?.map((cat) => (
                <Badge key={cat.id} variant="secondary" className="text-xs cursor-pointer">
                  {cat.icon} {cat.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">ট্যাগ</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="text-xs bg-accent/30 cursor-pointer hover:bg-accent transition-colors">
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RightSidebar;
