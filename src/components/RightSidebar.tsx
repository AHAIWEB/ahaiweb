import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, PenTool } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const RightSidebar = () => {
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

      {/* Map placeholder */}
      <Card className="news-card">
        <CardHeader className="pb-2">
          <CardTitle className="section-title text-base !mb-0">ম্যাপ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">
            🗺️ বাংলাদেশ ম্যাপ (শীঘ্রই আসছে)
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "সিলেট", "খুলনা"].map(tag => (
              <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RightSidebar;
