import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Heart, Newspaper, Globe, Radio, Loader2, ExternalLink, RefreshCw, Plane, Users, ChevronLeft, ChevronRight, ArrowLeft, Play } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useSearchParams } from "react-router-dom";

interface RssItem {
  title: string; link: string; description: string; pubDate: string; image: string; source: string; category: string;
}
interface Post {
  id: string; title: string; excerpt: string | null; featured_image: string | null; created_at: string;
  likes: number | null; post_type: string; slug: string; category_id: string | null;
  source_url: string | null; source_name: string | null;
  categories?: { name: string; icon: string | null; color: string | null } | null;
  post_locations?: { divisions?: { bn_name: string } | null }[];
  post_categories?: { categories: { name: string; icon: string | null; color: string | null } }[];
}

/* ── Embla Slide Controls ── */
const SlideControls = ({ emblaApi }: { emblaApi: any }) => {
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => { setCanPrev(emblaApi.canScrollPrev()); setCanNext(emblaApi.canScrollNext()); };
    emblaApi.on("select", onSelect); onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={scrollPrev} disabled={!canPrev}><ChevronLeft className="h-3.5 w-3.5" /></Button>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={scrollNext} disabled={!canNext}><ChevronRight className="h-3.5 w-3.5" /></Button>
    </div>
  );
};

/* ── Dot indicators ── */
const SlideDots = ({ emblaApi, count }: { emblaApi: any; count: number }) => {
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect); onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  return (
    <div className="flex justify-center gap-1 mt-2">
      {Array.from({ length: count }).map((_, i) => (
        <button key={i} onClick={() => emblaApi?.scrollTo(i)}
          className={`h-1.5 rounded-full transition-all duration-300 ${i === selected ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"}`} />
      ))}
    </div>
  );
};

const MainContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategorySlug = searchParams.get("category");

  const [rssItems, setRssItems] = useState<RssItem[]>([]);
  const [rssLoading, setRssLoading] = useState(true);
  const [rssError, setRssError] = useState(false);

  const autoplayPlugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));
  const autoplayPlugin2 = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));

  const [travelRef, travelApi] = useEmblaCarousel({ loop: true, align: "start" }, [autoplayPlugin.current]);
  const [familyRef, familyApi] = useEmblaCarousel({ loop: true, align: "center", containScroll: false }, [autoplayPlugin2.current]);

  const { data: siteSections } = useQuery({
    queryKey: ["site-sections"],
    queryFn: async () => {
      const { data } = await supabase.from("site_sections").select("*").order("sort_order");
      return (data as any[]) || [];
    },
  });

  const { data: allCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data || [];
    },
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["homepage-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("*, categories(name, icon, color), post_locations(divisions(bn_name)), post_categories(categories(name, icon, color))")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(50);
      return (data as any as Post[]) || [];
    },
  });

  const fetchRss = async () => {
    setRssLoading(true); setRssError(false);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-rss");
      if (!error && data?.success) setRssItems(data.data || []); else setRssError(true);
    } catch { setRssError(true); } finally { setRssLoading(false); }
  };
  useEffect(() => { fetchRss(); }, []);

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("bn-BD", { day: "numeric", month: "long" }); } catch { return d; }
  };

  const photoPosts = posts?.filter((p) => p.post_type === "quick" && p.featured_image) || [];
  const writingPosts = posts?.filter((p) => p.post_type === "editor") || [];
  const urlPosts = posts?.filter((p) => p.post_type === "url") || [];
  const videoPosts = getPostsByCategory("ভিডিও");

  const getPostsByCategory = (slug: string) => {
    const cat = allCategories?.find((c) => c.slug === slug || c.name.includes(slug));
    if (!cat) return [];
    return posts?.filter((p) => p.category_id === cat.id || p.post_categories?.some((pc) => pc.categories?.name === cat.name)) || [];
  };

  const travelPosts = getPostsByCategory("ভ্রমণ");
  const familyPosts = getPostsByCategory("ফ্যামিলি");

  const travelData = travelPosts.length > 0
    ? travelPosts.slice(0, 6).map((p) => ({ id: p.id, title: p.title, img: p.featured_image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop" }))
    : [
      { id: "d1", title: "কক্সবাজার সমুদ্র সৈকত", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop" },
      { id: "d2", title: "সুন্দরবন ম্যানগ্রোভ", img: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=600&h=400&fit=crop" },
      { id: "d3", title: "সাজেক ভ্যালি", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop" },
      { id: "d4", title: "রাতারগুল জলাবন", img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop" },
    ];

  const familyData = familyPosts.length > 0
    ? familyPosts.slice(0, 8).map((p) => ({ id: p.id, title: p.title, img: p.featured_image || "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=400&fit=crop" }))
    : [
      { id: "f1", title: "পরিবারের সময়", img: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=400&fit=crop" },
      { id: "f2", title: "শৈশবের স্মৃতি", img: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=400&fit=crop" },
      { id: "f3", title: "আনন্দের মুহূর্ত", img: "https://images.unsplash.com/photo-1597524678053-5e6cd0b89a8b?w=400&h=400&fit=crop" },
      { id: "f4", title: "একসাথে খেলা", img: "https://images.unsplash.com/photo-1506836467174-27f1042aa48c?w=400&h=400&fit=crop" },
    ];

  const PostBadges = ({ post }: { post: Post }) => (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {post.categories && (
        <Badge className="text-[10px] h-5 border-0" style={{
          backgroundColor: post.categories.color ? `${post.categories.color}20` : undefined,
          color: post.categories.color || undefined,
          border: `1px solid ${post.categories.color || 'hsl(var(--border))'}`,
        }}>
          {post.categories.icon} {post.categories.name}
        </Badge>
      )}
      {post.post_categories?.map((pc, i) => (
        <Badge key={i} className="text-[10px] h-5 border-0" style={{
          backgroundColor: pc.categories?.color ? `${pc.categories.color}20` : undefined,
          color: pc.categories?.color || undefined,
          border: `1px solid ${pc.categories?.color || 'hsl(var(--border))'}`,
        }}>
          {pc.categories?.icon} {pc.categories?.name}
        </Badge>
      ))}
    </div>
  );

  const rssCategories = ["দেশীয়", "আন্তর্জাতিক", "গ্রামের খবর"];
  const getRssByCategory = (cat: string) => rssItems.filter((item) => item.category === cat).slice(0, 5);

  const visibleSections = siteSections?.filter((s: any) => s.is_visible) || [];

  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case "news":
        return (
          <Card className="news-card" key="news">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="section-title text-base !mb-0">📰 সংবাদ (লাইভ)</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchRss} disabled={rssLoading}>
                <RefreshCw className={`h-3.5 w-3.5 ${rssLoading ? "animate-spin" : ""}`} />
              </Button>
            </CardHeader>
            <CardContent>
              {rssLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /><span className="text-sm">সংবাদ লোড হচ্ছে...</span>
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
                    <TabsTrigger value="গ্রামের খবর" className="text-xs gap-1"><Radio className="h-3 w-3" /> গ্রামের খবর</TabsTrigger>
                  </TabsList>
                  {rssCategories.map((category) => (
                    <TabsContent key={category} value={category} className="mt-3 space-y-3">
                      {getRssByCategory(category).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">এই ক্যাটেগরিতে কোনো সংবাদ নেই</p>
                      ) : getRssByCategory(category).map((item, i) => (
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
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        );

      case "camera":
        return (
          <Card className="news-card" key="camera">
            <CardHeader className="pb-2">
              <CardTitle className="section-title text-base !mb-0">📸 আমার ক্যামেরা</CardTitle>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin" /></div>
              ) : photoPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">কোনো ছবি পোস্ট নেই</p>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                  {photoPosts.slice(0, 8).map((p) => (
                    <div key={p.id} className="min-w-[160px] h-[120px] rounded-lg bg-muted overflow-hidden shrink-0 relative group cursor-pointer snap-start">
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
        );

      case "travel":
        return (
          <Card className="news-card overflow-hidden" key="travel">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="section-title text-base !mb-0 flex items-center gap-1.5">
                <Plane className="h-4 w-4" /> ভ্রমণ
              </CardTitle>
              <SlideControls emblaApi={travelApi} />
            </CardHeader>
            <CardContent className="px-0 pb-3">
              <div className="overflow-hidden" ref={travelRef}>
                <div className="flex">
                  {travelData.map((item) => (
                    <div key={item.id} className="flex-[0_0_85%] min-w-0 pl-4 first:pl-4">
                      <div className="relative rounded-xl overflow-hidden aspect-[16/9] group cursor-pointer">
                        <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white text-sm font-bold drop-shadow-lg">{item.title}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Plane className="h-3 w-3 text-white/70" />
                            <span className="text-[10px] text-white/70">ভ্রমণ গাইড</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <SlideDots emblaApi={travelApi} count={travelData.length} />
            </CardContent>
          </Card>
        );

      case "writing":
        return (
          <Card className="news-card overflow-hidden" key="writing">
            <CardHeader className="pb-2">
              <CardTitle className="section-title text-base !mb-0">✍️ লেখালেখি</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {postsLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin" /></div>
              ) : writingPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">কোনো লেখা পোস্ট নেই</p>
              ) : (
                <div>
                  {writingPosts[0] && (
                    <div className="relative group cursor-pointer">
                      {writingPosts[0].featured_image && (
                        <div className="aspect-[16/9] overflow-hidden">
                          <img src={writingPosts[0].featured_image} alt={writingPosts[0].title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        </div>
                      )}
                      <div className={`${writingPosts[0].featured_image ? 'absolute bottom-0 left-0 right-0' : ''} p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-primary/90 text-primary-foreground text-[10px] border-0">✍️ লেখালেখি</Badge>
                          <span className={`text-[10px] ${writingPosts[0].featured_image ? 'text-white/70' : 'text-muted-foreground'}`}>
                            {formatDate(writingPosts[0].created_at)}
                          </span>
                        </div>
                        <Link to={`/post/${writingPosts[0].slug}`} className={`text-base font-bold leading-snug ${writingPosts[0].featured_image ? 'text-white' : 'text-foreground group-hover:text-primary'} transition-colors hover:underline`}>
                          {writingPosts[0].title}
                        </Link>
                        {writingPosts[0].excerpt && (
                          <p className={`text-xs mt-1.5 line-clamp-2 ${writingPosts[0].featured_image ? 'text-white/70' : 'text-muted-foreground'}`}>
                            {writingPosts[0].excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="divide-y divide-border">
                    {writingPosts.slice(1, 5).map((post, idx) => (
                      <Link key={post.id} to={`/post/${post.slug}`} className="group block cursor-pointer px-4 py-3 hover:bg-muted/50 transition-colors flex gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0 mt-0.5">
                          {idx + 2}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold group-hover:text-primary transition-colors leading-tight line-clamp-2">{post.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(post.created_at)}</span>
                            <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes || 0}</span>
                          </div>
                          <PostBadges post={post} />
                        </div>
                        {post.featured_image && (
                          <div className="w-16 h-16 rounded-lg bg-muted shrink-0 overflow-hidden">
                            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "family":
        return (
          <Card className="news-card overflow-hidden" key="family">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="section-title text-base !mb-0 flex items-center gap-1.5">
                <Users className="h-4 w-4" /> ফ্যামিলি
              </CardTitle>
              <SlideControls emblaApi={familyApi} />
            </CardHeader>
            <CardContent className="px-0 pb-3">
              <div className="overflow-hidden" ref={familyRef}>
                <div className="flex">
                  {familyData.map((item) => (
                    <div key={item.id} className="flex-[0_0_45%] min-w-0 pl-3 first:pl-4">
                      <div className="relative group cursor-pointer">
                        <div className="rounded-2xl overflow-hidden aspect-[3/4] ring-2 ring-border/50 group-hover:ring-primary/50 transition-all duration-300">
                          <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-xs font-bold drop-shadow-lg line-clamp-2">{item.title}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <SlideDots emblaApi={familyApi} count={familyData.length} />
            </CardContent>
          </Card>
        );

      case "url-posts":
        return urlPosts.length > 0 ? (
          <Card className="news-card" key="url-posts">
            <CardHeader className="pb-2">
              <CardTitle className="section-title text-base !mb-0">🔗 শেয়ার করা লিংক</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {urlPosts.slice(0, 5).map((post) => (
                <Link key={post.id} to={`/post/${post.slug}`} className="group block border-b border-border last:border-0 pb-3 last:pb-0">
                  <div className="flex gap-3">
                    {post.featured_image && (
                      <div className="w-16 h-16 rounded-md bg-muted shrink-0 overflow-hidden">
                        <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{post.title}</h4>
                      {post.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
                        {post.source_name && <Badge variant="outline" className="text-[10px] h-5">{post.source_name}</Badge>}
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <PostBadges post={post} />
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        ) : null;

      case "video":
        return (
          <Card className="news-card" key="video">
            <CardHeader className="pb-2">
              <CardTitle className="section-title text-base !mb-0 flex items-center gap-1.5">
                <Play className="h-4 w-4" /> ভিডিও
              </CardTitle>
            </CardHeader>
            <CardContent>
              {videoPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">কোনো ভিডিও পোস্ট নেই</p>
              ) : (
                <div className="space-y-3">
                  {videoPosts.slice(0, 5).map((post) => (
                    <Link key={post.id} to={`/post/${post.slug}`} className="group flex gap-3 border-b border-border last:border-0 pb-3 last:pb-0">
                      {post.featured_image && (
                        <div className="w-24 h-16 rounded-md bg-muted shrink-0 overflow-hidden relative">
                          <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="h-5 w-5 text-white fill-white" />
                          </div>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-2">{post.title}</h4>
                        <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        // Handle category sections dynamically
        if (sectionKey.startsWith("cat-")) {
          const catSlug = sectionKey.replace("cat-", "");
          const catPosts = getPostsByCategory(catSlug);
          const sectionInfo = visibleSections.find((s: any) => s.section_key === sectionKey);
          if (catPosts.length === 0) return null;
          return (
            <Card className="news-card" key={sectionKey}>
              <CardHeader className="pb-2">
                <CardTitle className="section-title text-base !mb-0">{sectionInfo?.icon} {sectionInfo?.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {catPosts.slice(0, 5).map((post) => (
                  <Link key={post.id} to={`/post/${post.slug}`} className="group flex gap-3 border-b border-border last:border-0 pb-2 last:pb-0">
                    {post.featured_image && (
                      <div className="w-16 h-16 rounded-md bg-muted shrink-0 overflow-hidden">
                        <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-2">{post.title}</h4>
                      {post.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{post.excerpt}</p>}
                      <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          );
        }
        // Handle ad slots
        const section = visibleSections.find((s: any) => s.section_key === sectionKey);
        if (section?.config?.type === "ad" && section?.config?.ad_code) {
          return (
            <div key={sectionKey} className="w-full" dangerouslySetInnerHTML={{ __html: section.config.ad_code }} />
          );
        }
        return null;
    }
  };

  // Active category info
  const activeCategory = activeCategorySlug
    ? allCategories?.find((c) => c.slug === activeCategorySlug)
    : null;

  // Get all posts matching a category (including children via post_categories)
  const filteredPosts = activeCategory
    ? posts?.filter((p) => {
        if (p.category_id === activeCategory.id) return true;
        if (p.post_categories?.some((pc) => pc.categories?.name === activeCategory.name)) return true;
        // Also match child categories
        const childCats = allCategories?.filter((c) => c.parent_id === activeCategory.id) || [];
        return childCats.some((child) =>
          p.category_id === child.id || p.post_categories?.some((pc) => pc.categories?.name === child.name)
        );
      }) || []
    : [];

  // If a category filter is active, show filtered view
  if (activeCategorySlug && activeCategory) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={() => setSearchParams({})}>
            <ArrowLeft className="h-3.5 w-3.5" /> হোম
          </Button>
          <h2 className="text-lg font-bold flex items-center gap-2">
            {activeCategory.icon && <span>{activeCategory.icon}</span>}
            {activeCategory.name}
          </h2>
          <Badge variant="outline" className="text-xs">{filteredPosts.length} পোস্ট</Badge>
        </div>

        {postsLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : filteredPosts.length === 0 ? (
          <Card className="news-card">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-sm">এই ক্যাটেগরিতে কোনো পোস্ট নেই</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Featured first post */}
            {filteredPosts[0] && (
              <Card className="news-card overflow-hidden">
                <div className="relative group cursor-pointer">
                  {filteredPosts[0].featured_image && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={filteredPosts[0].featured_image} alt={filteredPosts[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    </div>
                  )}
                  <div className={`${filteredPosts[0].featured_image ? 'absolute bottom-0 left-0 right-0' : ''} p-4`}>
                    <h3 className={`text-base font-bold leading-snug ${filteredPosts[0].featured_image ? 'text-white' : 'text-foreground'}`}>
                      {filteredPosts[0].title}
                    </h3>
                    {filteredPosts[0].excerpt && (
                      <p className={`text-xs mt-1.5 line-clamp-2 ${filteredPosts[0].featured_image ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {filteredPosts[0].excerpt}
                      </p>
                    )}
                    <div className={`flex items-center gap-3 mt-2 text-xs ${filteredPosts[0].featured_image ? 'text-white/60' : 'text-muted-foreground'}`}>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(filteredPosts[0].created_at)}</span>
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {filteredPosts[0].likes || 0}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Remaining posts list */}
            {filteredPosts.length > 1 && (
              <Card className="news-card">
                <CardContent className="p-0 divide-y divide-border">
                  {filteredPosts.slice(1).map((post) => (
                    <div key={post.id} className="group cursor-pointer px-4 py-3 hover:bg-muted/50 transition-colors flex gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold group-hover:text-primary transition-colors leading-tight line-clamp-2">{post.title}</h4>
                        {post.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(post.created_at)}</span>
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes || 0}</span>
                        </div>
                        <PostBadges post={post} />
                      </div>
                      {post.featured_image && (
                        <div className="w-20 h-20 rounded-lg bg-muted shrink-0 overflow-hidden">
                          <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  }

  // If site_sections loaded, render in order; otherwise fallback
  const orderedKeys = visibleSections.length > 0
    ? visibleSections.map((s: any) => s.section_key)
    : ["news", "camera", "travel", "writing", "family", "url-posts"];

  return (
    <div className="space-y-6">
      {orderedKeys.map((key: string) => renderSection(key))}
    </div>
  );
};

export default MainContent;
