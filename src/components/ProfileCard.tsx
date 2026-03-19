import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Globe, Calendar, Facebook, Twitter, Instagram, Linkedin, Youtube, Github, Music, Camera, PinIcon, BookOpen, Link2 } from "lucide-react";

const socialLinks = [
  { icon: Facebook, url: "https://www.facebook.com/AHAiWEB", label: "Facebook Profile" },
  { icon: Facebook, url: "https://www.facebook.com/ahaiweb01", label: "Facebook Page" },
  { icon: Instagram, url: "https://www.instagram.com/ahaiweb01/", label: "Instagram" },
  { icon: Link2, url: "https://www.threads.com/@ahaiweb01", label: "Threads" },
  { icon: Linkedin, url: "https://www.linkedin.com/in/ahaiweb", label: "LinkedIn" },
  { icon: Youtube, url: "https://www.youtube.com/@AHAiWEBS", label: "YouTube" },
  { icon: Github, url: "https://github.com/AHAIWEB", label: "GitHub" },
  { icon: Camera, url: "https://unsplash.com/@ahaiweb", label: "Unsplash" },
  { icon: PinIcon, url: "https://www.pinterest.com/ahaiweb", label: "Pinterest" },
  { icon: BookOpen, url: "https://www.tumblr.com/ahaiweb", label: "Tumblr" },
  { icon: Music, url: "https://soundcloud.com/ahaiweb", label: "SoundCloud" },
  { icon: Music, url: "https://open.spotify.com/user/31vlzdnxayney7u6iifjo5izyvga", label: "Spotify" },
  { icon: Globe, url: "https://www.slideshare.net/AbdulHaiRahat", label: "SlideShare" },
  { icon: BookOpen, url: "https://www.bangla-kobita.com/abdulhairahat/poem20121125024311/", label: "বাংলা কবিতা" },
  { icon: Link2, url: "https://instabio.cc/AHAIWEB", label: "InstaBio" },
];

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

        {/* Social Media Links */}
        <div className="mt-4 flex justify-center gap-1.5 flex-wrap">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              title={social.label}
              className="p-1.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-muted-foreground"
            >
              <social.icon className="h-3.5 w-3.5" />
            </a>
          ))}
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
