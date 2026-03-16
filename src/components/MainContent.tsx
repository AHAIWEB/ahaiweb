import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Heart, MessageCircle } from "lucide-react";

const samplePosts = [
  {
    id: 1,
    label: "ভ্রমণ",
    title: "সুন্দরবনের গহীনে একদিন",
    excerpt: "পৃথিবীর সবচেয়ে বড় ম্যানগ্রোভ বনের অজানা গল্প...",
    image: "/placeholder.svg",
    date: "১৫ মার্চ, ২০২৬",
    likes: 42,
    comments: 8,
  },
  {
    id: 2,
    label: "লেখালেখি",
    title: "স্মৃতির পাতায় গ্রামের সেই দিনগুলো",
    excerpt: "শৈশবের সেই রংধনু ছোঁয়া দিনগুলো আজও মনে পড়ে...",
    image: "/placeholder.svg",
    date: "১২ মার্চ, ২০২৬",
    likes: 67,
    comments: 15,
  },
  {
    id: 3,
    label: "সংবাদ",
    title: "ডিজিটাল বাংলাদেশের নতুন অধ্যায়",
    excerpt: "প্রযুক্তির নতুন দিগন্তে বাংলাদেশ...",
    image: "/placeholder.svg",
    date: "১০ মার্চ, ২০২৬",
    likes: 35,
    comments: 12,
  },
];

const labelColors: Record<string, string> = {
  "ভ্রমণ": "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  "লেখালেখি": "bg-violet-500/10 text-violet-700 border-violet-200",
  "সংবাদ": "bg-blue-500/10 text-blue-700 border-blue-200",
  "ফ্যামিলি": "bg-rose-500/10 text-rose-700 border-rose-200",
};

const MainContent = () => {
  return (
    <div className="space-y-6">
      {/* Photo Carousel Placeholder */}
      <Card className="news-card">
        <CardHeader className="pb-2">
          <CardTitle className="section-title text-base !mb-0">📸 আমার ক্যামেরা</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="min-w-[160px] h-[120px] rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm shrink-0"
              >
                ফটো {i}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {samplePosts.map((post) => (
        <Card key={post.id} className="news-card group cursor-pointer">
          <div className="md:flex">
            <div className="md:w-1/3">
              <div className="aspect-video md:aspect-square bg-muted flex items-center justify-center text-muted-foreground">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex-1 p-4 md:p-5">
              <Badge variant="outline" className={`text-xs mb-2 ${labelColors[post.label] || ''}`}>
                {post.label}
              </Badge>
              <h3 className="text-lg font-bold group-hover:text-primary transition-colors leading-tight">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" /> {post.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> {post.comments}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Video Section Placeholder */}
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
