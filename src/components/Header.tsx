import { Search, Bell, Moon, Sun, Menu, Settings, LogIn, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isDark, setIsDark] = useState(false);
  const { user } = useAuth();

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      {/* Ticker */}
      <div className="ticker-bar flex items-center gap-3 overflow-hidden">
        <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-bold shrink-0">
          ব্রেকিং
        </span>
        <div className="truncate text-xs">
          আজকের শীর্ষ সংবাদ • নতুন ব্লগ পোস্ট প্রকাশিত • ভ্রমণ গাইড আপডেট হয়েছে
        </div>
      </div>
      
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight">
            <span className="text-primary">AHAi</span>
            <span className="text-foreground">WEB</span>
          </h1>
        </div>

        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="অনুসন্ধান করুন..."
              className="pl-9 h-9 bg-muted border-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          {user ? (
            <Button variant="ghost" size="sm" className="h-9 text-xs gap-1" asChild>
              <Link to="/admin"><Settings className="h-4 w-4" /> অ্যাডমিন</Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-9 text-xs gap-1" asChild>
              <Link to="/login"><LogIn className="h-4 w-4" /> লগইন</Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleDark}>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Category Nav */}
      <nav className="max-w-7xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto text-sm scrollbar-hide">
        {["হোম", "আমার ক্যামেরা", "ভ্রমণ", "ফ্যামিলি", "লেখালেখি", "সংবাদ", "ভিডিও", "পিপল", "কলম", "ম্যাপ"].map((item, i) => (
          <Button
            key={item}
            variant={i === 0 ? "default" : "ghost"}
            size="sm"
            className="shrink-0 h-7 text-xs rounded-full"
          >
            {item}
          </Button>
        ))}
      </nav>
    </header>
  );
};

export default Header;
