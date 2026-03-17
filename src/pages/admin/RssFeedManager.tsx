import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Rss, ExternalLink, ToggleLeft, ToggleRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = ["দেশীয়", "আন্তর্জাতিক", "গ্রামের খবর"];

const RssFeedManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("দেশীয়");

  const { data: feeds, isLoading } = useQuery({
    queryKey: ["rss-feeds"],
    queryFn: async () => {
      const { data } = await supabase.from("rss_feeds").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const addFeed = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("rss_feeds").insert({ name, url, category });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rss-feeds"] });
      setName(""); setUrl(""); setCategory("দেশীয়");
      toast({ title: "ফিড যুক্ত হয়েছে" });
    },
    onError: (e: any) => toast({ title: "ত্রুটি", description: e.message, variant: "destructive" }),
  });

  const deleteFeed = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rss_feeds").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rss-feeds"] });
      toast({ title: "ফিড মুছে ফেলা হয়েছে" });
    },
  });

  const toggleFeed = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("rss_feeds").update({ is_active: !is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rss-feeds"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📡 RSS Feed Manager</h1>
        <p className="text-muted-foreground text-sm mt-1">সংবাদ ফিড যোগ, সম্পাদনা ও পরিচালনা করুন</p>
      </div>

      {/* Add new feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" /> নতুন ফিড যোগ করুন</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input placeholder="ফিডের নাম (যেমন: প্রথম আলো)" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="RSS URL (https://...)" value={url} onChange={(e) => setUrl(e.target.value)} className="md:col-span-2" />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button className="mt-3 gap-2" onClick={() => addFeed.mutate()} disabled={!name || !url || addFeed.isPending}>
            <Rss className="h-4 w-4" /> যোগ করুন
          </Button>
        </CardContent>
      </Card>

      {/* Feed list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">সকল ফিড ({feeds?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">লোড হচ্ছে...</p>
          ) : feeds?.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">কোনো ফিড নেই</p>
          ) : (
            <div className="space-y-2">
              {feeds?.map((feed) => (
                <div key={feed.id} className={`flex items-center gap-3 p-3 rounded-lg border ${feed.is_active ? 'bg-card' : 'bg-muted/50 opacity-60'}`}>
                  <button onClick={() => toggleFeed.mutate({ id: feed.id, is_active: feed.is_active })} className="shrink-0">
                    {feed.is_active ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{feed.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{feed.url}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px]">{feed.category}</Badge>
                  <a href={feed.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                    onClick={() => deleteFeed.mutate(feed.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RssFeedManager;
