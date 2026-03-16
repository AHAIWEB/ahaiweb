import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Star, Quote } from "lucide-react";

const LeftSidebar = () => {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  };
  const todayBn = today.toLocaleDateString('bn-BD', options);

  return (
    <div className="space-y-4">
      <Card className="news-card">
        <CardHeader className="pb-2">
          <CardTitle className="section-title text-base !mb-0">আজকের দিন</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-8">
              <TabsTrigger value="today" className="text-xs gap-1">
                <CalendarDays className="h-3 w-3" /> এই দিনে
              </TabsTrigger>
              <TabsTrigger value="horoscope" className="text-xs gap-1">
                <Star className="h-3 w-3" /> রাশি
              </TabsTrigger>
              <TabsTrigger value="quotes" className="text-xs gap-1">
                <Quote className="h-3 w-3" /> উক্তি
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-3">
              <p className="text-sm font-medium text-foreground">{todayBn}</p>
              <div className="mt-3 space-y-3">
                <div className="border-l-2 border-accent pl-3">
                  <p className="text-xs text-muted-foreground">১৯৭১</p>
                  <p className="text-sm">স্বাধীনতা যুদ্ধের ঘটনা...</p>
                </div>
                <div className="border-l-2 border-accent pl-3">
                  <p className="text-xs text-muted-foreground">১৯৫২</p>
                  <p className="text-sm">ভাষা আন্দোলনের ইতিহাস...</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="horoscope" className="mt-3">
              <div className="text-center py-4">
                <p className="text-3xl mb-2">♈</p>
                <p className="font-medium text-sm">মেষ রাশি</p>
                <p className="text-xs text-muted-foreground mt-2">
                  আজ আপনার জন্য শুভ দিন। নতুন উদ্যোগ শুরু করার উপযুক্ত সময়।
                </p>
              </div>
            </TabsContent>

            <TabsContent value="quotes" className="mt-3">
              <blockquote className="border-l-2 border-primary pl-3 italic text-sm text-muted-foreground">
                "জীবন হলো এক অদ্ভুত ভ্রমণ, যেখানে প্রতিটি মোড়ে নতুন অভিজ্ঞতা অপেক্ষা করছে।"
              </blockquote>
              <p className="text-xs text-right mt-2 text-muted-foreground">— রবীন্দ্রনাথ ঠাকুর</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeftSidebar;
