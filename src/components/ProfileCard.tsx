import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Globe, Calendar } from "lucide-react";

const ProfileCard = () => {
  return (
    <Card className="news-card overflow-hidden">
      {/* Cover */}
      <div className="h-24 bg-[image:var(--gradient-hero)]" />
      
      {/* Avatar */}
      <div className="flex justify-center -mt-12">
        <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
          <AvatarImage src="/placeholder.svg" alt="AHAiWEB" />
          <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
            AH
          </AvatarFallback>
        </Avatar>
      </div>
      
      <CardContent className="text-center pt-3 pb-5">
        <h2 className="text-xl font-bold text-foreground">AHAiWEB</h2>
        <p className="text-sm text-muted-foreground mt-1">ব্লগার | ফটোগ্রাফার | ভ্রমণকারী</p>
        
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>বাংলাদেশ</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span>ahaiweb.com</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>যোগদান: ২০২৪</span>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-6 text-center">
          <div>
            <p className="text-lg font-bold text-foreground">১২৫</p>
            <p className="text-xs text-muted-foreground">পোস্ট</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">৩.২K</p>
            <p className="text-xs text-muted-foreground">ভিউ</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">৮৭</p>
            <p className="text-xs text-muted-foreground">ফলোয়ার</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
