import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Heart, MapPin, Newspaper, Globe, Radio, Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  image: string;
  source: string;
  category: string;
}

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
  created_at: string;
  likes: number | null;
  post_type: string;
  slug: string;
  category_id: string | null;
  source_url: string | null;
  categories?: { name: string; icon: string | null; color: string | null } | null;
  post_locations?: { divisions?: { bn_name: string } | null }[];
}

const MainContent = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [rssItems, setRssItems] = useState<RssItem[]>([]);
  const [rssLoading, setRssLoading] = useState(true);
  const [rssError, setRssError] = useState(false);

  useEffect(() => {
    supabase
      .from("posts")
      .select("*, categories(name, icon, color), post_locations(divisions(bn_name))")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setPosts((data as any) || []);
        setPostsLoading(false);
      });
  }, []);

  const fetchRss = async () => {
    setRssLoading(true);
    setRssError(false);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-rss");
      if (!error && data?.success) setRssItems(data.data || []);
      else setRssError(true);
    } catch { setRssError(true); }
    finally { setRssLoading(false); }
  };

  useEffect(() => { fetchRss(); }, []);

  const formatDate = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleDateString("bn-BD", { day: "numeric", month: "long" }); }
    catch { return dateStr; }
  };

  const rssCategories = ["দেশীয়", "আন্তর্জাতিক", "টেক"];
  const getRssByCategory = (cat: string) => rssItems.filter((item) => item.category === cat).slice(0, 5);

  // Group posts by category
  const photoPosts = posts.filter((p) => p.post_type === "quick" && p.featured_image);
  const writingPosts = posts.filter((p) => p.post_type === "editor");
  const urlPosts = posts.filter((p) => p.post_type === "url");

  return (
    <div className="space-y-6">
      {/* 📸 আমার ক্যামেরা - Real photos */}
      <Card className="news-card">
        <CardHeader className="pb-2">
          <CardTitle className="section-title text-base !mb-0">📸 আমার ক্যামেরা</CardTitle>
        </CardHeader>
        <CardContent>
          {postsLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : photoPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">কোনো ছবি পোস্ট নেই</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {photoPosts.slice(0, 8).map((p) => (
                <div key={p.id} className="min-w-[160px] h-[120px] rounded-lg bg-muted overflow-hidden shrink-0 relative group cursor-pointer">
                  <img src={p.featured_image!} alt={p.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-white text-xs font-medium line-clamp-2">{p.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✍️ লেখালেখি - Real editor posts */}
      <Card className="news-card">
        <CardHeader className="pb-2">
          <CardTitle className="section-title text-base !mb-0">✍️ লেখালেখি</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {postsLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : writingPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">কোনো লেখা পোস্ট নেই</p>
          ) : (
            writingPosts.slice(0, 5).map((post) => (
              <div key={post.id} className="group cursor-pointer border-b border-border last:border-0 pb-3 last:pb-0">
                <h3 className="text-sm font-bold group-hover:text-primary transition-colors">{post.title}</h3>
                {post.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(post.created_at)}</span>
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes || 0}</span>
                  {post.categories && (
                    <Badge variant="outline" className="text-[10px] h-5">{post.categories.icon} {post.categories.name}</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 🔗 URL পোস্ট */}
      {urlPosts.length > 0 && (
        <Card className="news-card">
          <CardHeader className="pb-2">
            <CardTitle className="section-title text-base !mb-0">🔗 শেয়ার করা লিংক</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {urlPosts.slice(0, 5).map((post) => (
              <a key={post.id} href={post.source_url || "#"} target="_blank" rel="noopener noreferrer" className="group block border-b border-border last:border-0 pb-3 last:pb-0">
                <div className="flex gap-3">
                  {post.featured_image && (
                    <div className="w-16 h-16 rounded-md bg-muted shrink-0 overflow-hidden">
                      <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{post.title}</h4>
                    {post.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 📰 সংবাদ - Live RSS */}
      <Card className="news-card">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="section-title text-base !mb-0">📰 সংবাদ (লাইভ)</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchRss} disabled={rssLoading}>
            <RefreshCw className={`h-3.5 w-3.5 ${rssLoading ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {rssLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">সংবাদ লোড হচ্ছে...</span>
            </div>
          ) : rssError ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-2">সংবাদ লোড করতে সমস্যা হয়েছে</p>
              <Button variant="outline" size="sm" onClick={fetchRss}>আবার চেষ্টা করুন</Button>
            </div>
          ) : (
            <Tabs defaultValue="দেশীয়" className="w-full">
              <TabsList className="w-full grid grid-cols-3 h-8">
                <TabsTrigger value="দেশীয়" className="text-xs gap-1"><Newspaper className="h-3 w-3" /> দেশীয়</TabsTrigger>
                <TabsTrigger value="আন্তর্জাতিক" className="text-xs gap-1"><Globe className="h-3 w-3" /> আন্তর্জাতিক</TabsTrigger>
                <TabsTrigger value="টেক" className="text-xs gap-1"><Radio className="h-3 w-3" /> টেক</TabsTrigger>
              </TabsList>
              {rssCategories.map((category) => (
                <TabsContent key={category} value={category} className="mt-3 space-y-3">
                  {getRssByCategory(category).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">এই ক্যাটেগরিতে কোনো সংবাদ নেই</p>
                  ) : (
                    getRssByCategory(category).map((item, i) => (
                      <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="group block border-b border-border last:border-0 pb-3 last:pb-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-bold group-hover:text-primary transition-colors leading-tight">{item.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-[10px] h-5">{item.source}</Badge>
                              <span className="text-xs text-muted-foreground">{formatDate(item.pubDate)}</span>
                              <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto" />
                            </div>
                          </div>
                          {item.image && (
                            <div className="w-16 h-16 rounded-md bg-muted shrink-0 overflow-hidden">
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                            </div>
                          )}
                        </div>
                      </a>
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MainContent;
