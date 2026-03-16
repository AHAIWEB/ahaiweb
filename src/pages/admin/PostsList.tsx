import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Plus, Trash2, Edit, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const PostsList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, categories(name, icon)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("এই পোস্ট মুছে ফেলতে চান?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফল", description: "পোস্ট মুছে ফেলা হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    }
  };

  const togglePublish = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const { error } = await supabase
      .from("posts")
      .update({
        status: newStatus,
        published_at: newStatus === "published" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast({ title: "সফল", description: newStatus === "published" ? "প্রকাশিত!" : "ড্রাফটে ফেরানো হয়েছে" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">পোস্ট সমূহ</h2>
        <div className="flex gap-2">
          <Button asChild size="sm"><Link to="/admin/quick-post"><Plus className="h-4 w-4 mr-1" /> কুইক পোস্ট</Link></Button>
          <Button asChild size="sm" variant="secondary"><Link to="/admin/editor-post"><Edit className="h-4 w-4 mr-1" /> এডিটর</Link></Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {post.categories && (
                        <Badge variant="outline" className="text-xs">
                          {(post.categories as any).icon} {(post.categories as any).name}
                        </Badge>
                      )}
                      <Badge variant={post.status === "published" ? "default" : "secondary"} className="text-xs">
                        {post.status === "published" ? "প্রকাশিত" : "ড্রাফট"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {post.post_type === "quick" ? "কুইক" : post.post_type === "url" ? "URL" : "এডিটর"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm truncate">{post.title}</h3>
                    {post.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{post.excerpt}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(post.created_at).toLocaleDateString("bn-BD")} • 👁 {post.views} • ❤ {post.likes}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => togglePublish(post.id, post.status)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(post.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            কোনো পোস্ট নেই। উপরের বাটনে ক্লিক করে নতুন পোস্ট তৈরি করুন।
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PostsList;
