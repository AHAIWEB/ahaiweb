import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Star, Quote, TrendingUp, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const zodiacSigns = [
  { name: "মেষ", symbol: "♈" }, { name: "বৃষ", symbol: "♉" }, { name: "মিথুন", symbol: "♊" },
  { name: "কর্কট", symbol: "♋" }, { name: "সিংহ", symbol: "♌" }, { name: "কন্যা", symbol: "♍" },
  { name: "তুলা", symbol: "♎" }, { name: "বৃশ্চিক", symbol: "♏" }, { name: "ধনু", symbol: "♐" },
  { name: "মকর", symbol: "♑" }, { name: "কুম্ভ", symbol: "♒" }, { name: "মীন", symbol: "♓" },
];

const fallbackQuotes = [
  { text: "জীবন হলো এক অদ্ভুত ভ্রমণ, যেখানে প্রতিটি মোড়ে নতুন অভিজ্ঞতা অপেক্ষা করছে।", author: "রবীন্দ্রনাথ ঠাকুর" },
  { text: "শিক্ষা হলো সেই জিনিস যা আপনি স্কুলে যা শিখেছেন তা ভুলে যাওয়ার পরেও থেকে যায়।", author: "আলবার্ট আইনস্টাইন" },
  { text: "ক্ষুধার রাজ্যে পৃথিবী গদ্যময়, পূর্ণিমার চাঁদ যেন ঝলসানো রুটি।", author: "সুকান্ত ভট্টাচার্য" },
];

const LeftSidebar = () => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const [selectedSign, setSelectedSign] = useState<string | null>(null);

  const todayBn = today.toLocaleDateString('bn-BD', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const { data: siteSections } = useQuery({
    queryKey: ["site-sections-left"],
    queryFn: async () => {
      const { data } = await supabase.from("site_sections").select("*").eq("zone" as any, "left_sidebar").order("sort_order");
      return (data as any[]) || [];
    },
  });

  const { data: dailyContent } = useQuery({
    queryKey: ["daily-content-sidebar", todayStr],
    queryFn: async () => {
      const { data } = await supabase.from("daily_content").select("*").eq("date", todayStr);
      return data || [];
    },
  });

  const onThisDay = dailyContent?.find((d: any) => d.content_type === "on_this_day")?.data as any;
  const horoscope = dailyContent?.find((d: any) => d.content_type === "horoscope")?.data as any;
  const quoteData = dailyContent?.find((d: any) => d.content_type === "quote")?.data as any;
  const todayQuote = quoteData?.text ? quoteData : fallbackQuotes[today.getDate() % fallbackQuotes.length];
  const selectedHoroscope = horoscope?.signs?.find((s: any) => s.name === selectedSign);

  const { data: recentPosts } = useQuery({
    queryKey: ["sidebar-recent"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, title, slug, created_at, views, likes, categories(name, icon, color)")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const { data: popularPosts } = useQuery({
    queryKey: ["sidebar-popular"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, title, slug, views, likes, categories(name, icon, color)")
        .eq("status", "published")
        .order("views", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["sidebar-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data || [];
    },
  });

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("bn-BD", { day: "numeric", month: "short" }); }
    catch { return d; }
  };

  const visibleSections = siteSections?.filter((s: any) => s.is_visible) || [];
  // Fallback keys if no sections configured
  const sectionKeys = visibleSections.length > 0
    ? visibleSections.map((s: any) => s.section_key)
    : ["today", "posts_recent_popular", "left_labels"];

  const renderWidget = (key: string) => {
    switch (key) {
      case "today":
        return (
          <Card className="news-card" key="today">
            <CardHeader className="pb-2">
              <CardTitle className="section-title text-base !mb-0">আজকের দিন</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="today" className="w-full">
                <TabsList className="w-full grid grid-cols-3 h-8">
                  <TabsTrigger value="today" className="text-xs gap-1"><CalendarDays className="h-3 w-3" /> এই দিনে</TabsTrigger>
                  <TabsTrigger value="horoscope" className="text-xs gap-1"><Star className="h-3 w-3" /> রাশি</TabsTrigger>
                  <TabsTrigger value="quotes" className="text-xs gap-1"><Quote className="h-3 w-3" /> উক্তি</TabsTrigger>
                </TabsList>
                <TabsContent value="today" className="mt-3">
                  <p className="text-sm font-medium text-foreground">{todayBn}</p>
                  <div className="mt-3 space-y-3">
                    {onThisDay?.events?.length ? (
                      onThisDay.events.map((e: any, i: number) => (
                        <div key={i} className="border-l-2 border-accent pl-3">
                          <p className="text-xs text-muted-foreground">{e.year}</p>
                          <p className="text-sm">{e.event}</p>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="border-l-2 border-accent pl-3">
                          <p className="text-xs text-muted-foreground">১৯৭১</p>
                          <p className="text-sm">স্বাধীনতা যুদ্ধের ঘটনা...</p>
                        </div>
                        <div className="border-l-2 border-accent pl-3">
                          <p className="text-xs text-muted-foreground">১৯৫২</p>
                          <p className="text-sm">ভাষা আন্দোলনের ইতিহাস...</p>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="horoscope" className="mt-3">
                  {selectedSign && selectedHoroscope ? (
                    <div>
                      <button onClick={() => setSelectedSign(null)} className="text-xs text-primary mb-2 hover:underline">← সব রাশি</button>
                      <div className="text-center py-2">
                        <p className="text-3xl">{selectedHoroscope.symbol}</p>
                        <p className="font-medium text-sm mt-1">{selectedHoroscope.name}</p>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{selectedHoroscope.prediction}</p>
                      </div>
                    </div>
                  ) : horoscope?.signs?.length ? (
                    <div className="grid grid-cols-4 gap-1.5">
                      {zodiacSigns.map((sign) => (
                        <button key={sign.name} onClick={() => setSelectedSign(sign.name)}
                          className="flex flex-col items-center p-2 rounded-lg hover:bg-muted transition-colors">
                          <span className="text-lg">{sign.symbol}</span>
                          <span className="text-[10px] mt-0.5">{sign.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-3xl mb-2">♈</p>
                      <p className="font-medium text-sm">মেষ রাশি</p>
                      <p className="text-xs text-muted-foreground mt-2">আজ আপনার জন্য শুভ দিন। নতুন উদ্যোগ শুরু করার উপযুক্ত সময়।</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="quotes" className="mt-3">
                  <blockquote className="border-l-2 border-primary pl-3 italic text-sm text-muted-foreground">"{todayQuote.text}"</blockquote>
                  <p className="text-xs text-right mt-2 text-muted-foreground">— {todayQuote.author}</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        );

      case "posts_recent_popular":
        return (
          <Card className="news-card" key="posts_recent_popular">
            <CardHeader className="pb-2">
              <CardTitle className="section-title text-base !mb-0">পোস্ট</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="recent" className="w-full">
                <TabsList className="w-full grid grid-cols-2 h-8">
                  <TabsTrigger value="recent" className="text-xs gap-1"><Clock className="h-3 w-3" /> সাম্প্রতিক</TabsTrigger>
                  <TabsTrigger value="popular" className="text-xs gap-1"><TrendingUp className="h-3 w-3" /> জনপ্রিয়</TabsTrigger>
                </TabsList>
                <TabsContent value="recent" className="mt-3 space-y-2.5">
                  {recentPosts?.map((post, i) => (
                    <div key={post.id} className="flex gap-2.5 items-start group cursor-pointer">
                      <span className="text-xs font-bold text-muted-foreground/50 mt-0.5 w-4 shrink-0">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors line-clamp-2">{post.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">{formatDate(post.created_at)}</span>
                          {(post.categories as any)?.name && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5">{(post.categories as any).icon} {(post.categories as any).name}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!recentPosts || recentPosts.length === 0) && <p className="text-xs text-muted-foreground text-center py-3">কোনো পোস্ট নেই</p>}
                </TabsContent>
                <TabsContent value="popular" className="mt-3 space-y-2.5">
                  {popularPosts?.map((post, i) => (
                    <div key={post.id} className="flex gap-2.5 items-start group cursor-pointer">
                      <span className="text-xs font-bold text-primary/60 mt-0.5 w-4 shrink-0">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors line-clamp-2">{post.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">👁 {post.views || 0} · ❤ {post.likes || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!popularPosts || popularPosts.length === 0) && <p className="text-xs text-muted-foreground text-center py-3">কোনো পোস্ট নেই</p>}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        );

      case "left_labels":
        return (
          <Card className="news-card" key="left_labels">
            <CardHeader className="pb-2">
              <CardTitle className="section-title text-base !mb-0">🏷️ লেবেল</CardTitle>
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

      default:
        // Ad slots
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

export default LeftSidebar;
