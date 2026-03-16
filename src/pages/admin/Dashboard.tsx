import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image, Eye, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const AdminDashboard = () => {
  const { data: postCount } = useQuery({
    queryKey: ["admin-post-count"],
    queryFn: async () => {
      const { count } = await supabase.from("posts").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: mediaCount } = useQuery({
    queryKey: ["admin-media-count"],
    queryFn: async () => {
      const { count } = await supabase.from("media").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: recentPosts } = useQuery({
    queryKey: ["admin-recent-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, title, status, created_at, views, likes")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const stats = [
    { label: "মোট পোস্ট", value: postCount ?? 0, icon: FileText, color: "text-primary" },
    { label: "মিডিয়া ফাইল", value: mediaCount ?? 0, icon: Image, color: "text-accent-foreground" },
    { label: "মোট ভিউ", value: recentPosts?.reduce((s, p) => s + (p.views || 0), 0) ?? 0, icon: Eye, color: "text-emerald-600" },
    { label: "মোট লাইক", value: recentPosts?.reduce((s, p) => s + (p.likes || 0), 0) ?? 0, icon: Heart, color: "text-rose-500" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">ড্যাশবোর্ড</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">সাম্প্রতিক পোস্ট</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPosts && recentPosts.length > 0 ? (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString("bn-BD")}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    post.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {post.status === "published" ? "প্রকাশিত" : "ড্রাফট"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">কোনো পোস্ট নেই। নতুন পোস্ট তৈরি করুন!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
