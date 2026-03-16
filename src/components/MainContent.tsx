import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Heart, MessageCircle, MapPin, ChevronLeft, ChevronRight, Newspaper, Globe, Radio } from "lucide-react";
import { useState, useRef } from "react";

const labelColors: Record<string, string> = {
  "আমার ক্যামেরা": "bg-amber-500/10 text-amber-700 border-amber-200",
  "ভ্রমণ": "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  "ফ্যামিলি": "bg-rose-500/10 text-rose-700 border-rose-200",
  "লেখালেখি": "bg-violet-500/10 text-violet-700 border-violet-200",
  "সংবাদ": "bg-blue-500/10 text-blue-700 border-blue-200",
  "ভিডিও": "bg-red-500/10 text-red-700 border-red-200",
  "পিপল": "bg-cyan-500/10 text-cyan-700 border-cyan-200",
  "কলম": "bg-indigo-500/10 text-indigo-700 border-indigo-200",
  "ম্যাপ": "bg-teal-500/10 text-teal-700 border-teal-200",
  "এই দিনে": "bg-orange-500/10 text-orange-700 border-orange-200",
};

const travelPosts = [
  { id: 1, title: "সুন্দরবনের গহীনে", location: "খুলনা", image: "/placeholder.svg" },
  { id: 2, title: "সাজেক ভ্যালির সকাল", location: "রাঙামাটি", image: "/placeholder.svg" },
  { id: 3, title: "কক্সবাজার সমুদ্র সৈকত", location: "কক্সবাজার", image: "/placeholder.svg" },
  { id: 4, title: "রাতারগুল জলাবন", location: "সিলেট", image: "/placeholder.svg" },
  { id: 5, title: "বান্দরবানের মেঘলা", location: "বান্দরবান", image: "/placeholder.svg" },
  { id: 6, title: "টাঙ্গুয়ার হাওর", location: "সুনামগঞ্জ", image: "/placeholder.svg" },
];

const familyPhotos = [
  { id: 1, caption: "পরিবারের সাথে ঈদ উদযাপন" },
  { id: 2, caption: "ছোটবেলার স্মৃতি" },
  { id: 3, caption: "বোনের বিয়ে" },
  { id: 4, caption: "বাবা-মায়ের বার্ষিকী" },
  { id: 5, caption: "পারিবারিক পিকনিক" },
];

const writingPosts = [
  { id: 1, title: "স্মৃতির পাতায় গ্রামের সেই দিনগুলো", excerpt: "শৈশবের সেই রংধনু ছোঁয়া দিনগুলো আজও মনে পড়ে...", date: "১২ মার্চ, ২০২৬", likes: 67 },
  { id: 2, title: "বৃষ্টির গান শুনতে শুনতে", excerpt: "বর্ষার এক বিকেলে জানালার ধারে বসে মনে পড়ে গেলো...", date: "৮ মার্চ, ২০২৬", likes: 45 },
  { id: 3, title: "একটি পুরনো চিঠির গল্প", excerpt: "ট্রাংকের তলায় পাওয়া সেই হলুদ হয়ে যাওয়া চিঠি...", date: "৫ মার্চ, ২০২৬", likes: 38 },
];

const newsSources = {
  "দেশীয়": [
    { title: "ডিজিটাল বাংলাদেশের নতুন অধ্যায়", source: "প্রথম আলো", date: "১৫ মার্চ", excerpt: "প্রযুক্তির নতুন দিগন্তে বাংলাদেশ..." },
    { title: "শিক্ষা খাতে নতুন বাজেট বরাদ্দ", source: "ডেইলি স্টার", date: "১৪ মার্চ", excerpt: "এবারের বাজেটে শিক্ষা খাতে ব্যাপক বরাদ্দ..." },
    { title: "পদ্মা সেতুতে ট্রেন চলাচল শুরু", source: "বিডি নিউজ", date: "১৩ মার্চ", excerpt: "অবশেষে পদ্মা সেতু রেল সংযোগ চালু..." },
  ],
  "আন্তর্জাতিক": [
    { title: "জলবায়ু সম্মেলনে নতুন প্রস্তাব", source: "BBC বাংলা", date: "১৫ মার্চ", excerpt: "জাতিসংঘের জলবায়ু সম্মেলনে গুরুত্বপূর্ণ প্রস্তাব..." },
    { title: "AI প্রযুক্তিতে নতুন মাইলফলক", source: "টেক ক্রাঞ্চ", date: "১৪ মার্চ", excerpt: "কৃত্রিম বুদ্ধিমত্তায় যুগান্তকারী আবিষ্কার..." },
  ],
  "টেক": [
    { title: "নতুন স্মার্টফোন বাজারে আসছে", source: "টেকশহর", date: "১৫ মার্চ", excerpt: "বাংলাদেশি ব্র্যান্ডের নতুন ফ্ল্যাগশিপ ফোন..." },
    { title: "ফ্রিল্যান্সিংয়ে বাংলাদেশের সাফল্য", source: "আইটি বাজার", date: "১৩ মার্চ", excerpt: "বিশ্বে ফ্রিল্যান্সিংয়ে দ্বিতীয় অবস্থানে..." },
  ],
};

const MainContent = () => {
  const [familySlide, setFamilySlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTravel = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      {/* 📸 আমার ক্যামেরা */}
      <Card className="news-card">
        <CardHeader className="pb-2">
          <CardTitle className="section-title text-base !mb-0">📸 আমার ক্যামেরা</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="min-w-[160px] h-[120px] rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm shrink-0">
                ফটো {i}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 🌍 ভ্রমণ - Slider Grid */}
      <Card className="news-card">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="section-title text-base !mb-0">🌍 ভ্রমণ</CardTitle>
          <div className="flex gap-1">
            <button onClick={() => scrollTravel("left")} className="h-7 w-7 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => scrollTravel("right")} className="h-7 w-7 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x">
            {travelPosts.map((post) => (
              <div key={post.id} className="min-w-[200px] snap-start shrink-0 group cursor-pointer">
                <div className="aspect-[4/3] rounded-lg bg-muted overflow-hidden relative">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white text-sm font-medium leading-tight">{post.title}</p>
                    <p className="text-white/70 text-xs flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {post.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Grid below slider */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {travelPosts.slice(0, 3).map((post) => (
              <div key={post.id} className="aspect-square rounded-md bg-muted overflow-hidden relative group cursor-pointer">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-white text-xs font-medium">{post.title}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 👨‍👩‍👧‍👦 ফ্যামিলি - Photo Slide */}
      <Card className="news-card">
        <CardHeader className="pb-2">
          <CardTitle className="section-title text-base !mb-0">👨‍👩‍👧‍👦 ফ্যামিলি</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="aspect-video rounded-lg bg-muted overflow-hidden relative">
              <img src="/placeholder.svg" alt={familyPhotos[familySlide].caption} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-sm font-medium">{familyPhotos[familySlide].caption}</p>
                <p className="text-white/60 text-xs mt-1">{familySlide + 1} / {familyPhotos.length}</p>
              </div>
            </div>
            <button
              onClick={() => setFamilySlide((p) => (p > 0 ? p - 1 : familyPhotos.length - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setFamilySlide((p) => (p < familyPhotos.length - 1 ? p + 1 : 0))}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {/* Thumbnail strip */}
          <div className="flex gap-2 mt-3">
            {familyPhotos.map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => setFamilySlide(i)}
                className={`h-14 w-14 rounded-md bg-muted overflow-hidden shrink-0 ring-2 transition-all ${i === familySlide ? "ring-primary" : "ring-transparent"}`}
              >
                <img src="/placeholder.svg" alt={photo.caption} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ✍️ লেখালেখি */}
      <Card className="news-card">
        <CardHeader className="pb-2">
          <CardTitle className="section-title text-base !mb-0">✍️ লেখালেখি</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {writingPosts.map((post) => (
            <div key={post.id} className="group cursor-pointer border-b border-border last:border-0 pb-3 last:pb-0">
              <h3 className="text-sm font-bold group-hover:text-primary transition-colors">{post.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.date}</span>
                <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 📰 সংবাদ - 3 Tabs */}
      <Card className="news-card">
        <CardHeader className="pb-2">
          <CardTitle className="section-title text-base !mb-0">📰 সংবাদ</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="দেশীয়" className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-8">
              <TabsTrigger value="দেশীয়" className="text-xs gap-1">
                <Newspaper className="h-3 w-3" /> দেশীয়
              </TabsTrigger>
              <TabsTrigger value="আন্তর্জাতিক" className="text-xs gap-1">
                <Globe className="h-3 w-3" /> আন্তর্জাতিক
              </TabsTrigger>
              <TabsTrigger value="টেক" className="text-xs gap-1">
                <Radio className="h-3 w-3" /> টেক
              </TabsTrigger>
            </TabsList>

            {Object.entries(newsSources).map(([category, items]) => (
              <TabsContent key={category} value={category} className="mt-3 space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="group cursor-pointer border-b border-border last:border-0 pb-3 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold group-hover:text-primary transition-colors leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.excerpt}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px] h-5">{item.source}</Badge>
                          <span className="text-xs text-muted-foreground">{item.date}</span>
                        </div>
                      </div>
                      <div className="w-16 h-16 rounded-md bg-muted shrink-0 overflow-hidden">
                        <img src="/placeholder.svg" alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* 🎬 ভিডিও */}
      <Card className="news-card">
        <CardHeader className="pb-2">
          <CardTitle className="section-title text-base !mb-0">🎬 ভিডিও</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                ▶ ভিডিও {i}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MainContent;
