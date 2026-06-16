import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Download, BookOpen, X } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { Link } from "react-router-dom";

const Dictionary = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: words = [], isLoading } = useQuery({
    queryKey: ["dictionary", q],
    queryFn: async () => {
      let query = supabase
        .from("dictionary_words")
        .select("*")
        .order("word", { ascending: true })
        .limit(200);
      if (q.trim()) {
        const term = q.trim().toLowerCase();
        query = query.or(`word.ilike.%${term}%,word_normalized.ilike.%${term}%,meaning_bn.ilike.%${term}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["fav-words", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_favorite_words")
        .select("word_id, dictionary_words(*)")
        .eq("user_id", user!.id);
      return data || [];
    },
  });

  const favIds = useMemo(() => new Set(favorites.map((f: any) => f.word_id)), [favorites]);

  const toggleFav = async (wordId: string) => {
    if (!user) {
      toast.error("ফেভারিট করতে লগইন করুন");
      return;
    }
    if (favIds.has(wordId)) {
      await supabase
        .from("user_favorite_words")
        .delete()
        .eq("user_id", user.id)
        .eq("word_id", wordId);
      toast.success("ফেভারিট থেকে সরানো হলো");
    } else {
      await supabase.from("user_favorite_words").insert({ user_id: user.id, word_id: wordId });
      toast.success("ফেভারিটে যোগ হলো");
    }
    qc.invalidateQueries({ queryKey: ["fav-words"] });
  };

  const downloadPdf = (list: any[], title: string) => {
    const pdf = new jsPDF();
    pdf.setFont("helvetica");
    pdf.setFontSize(16);
    pdf.text(title, 14, 18);
    pdf.setFontSize(10);
    let y = 30;
    list.forEach((w: any, i: number) => {
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }
      pdf.setFont("helvetica", "bold");
      pdf.text(`${i + 1}. ${w.word || ""}`, 14, y);
      y += 6;
      pdf.setFont("helvetica", "normal");
      const meaning = w.meaning_bn || w.meaning_en || "";
      const lines = pdf.splitTextToSize(meaning, 180);
      pdf.text(lines, 18, y);
      y += lines.length * 5 + 4;
    });
    pdf.save(`${title}.pdf`);
  };

  const highlight = (text: string, term: string) => {
    if (!term || !text) return text;
    const idx = text.toLowerCase().indexOf(term.toLowerCase());
    if (idx < 0) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded">
          {text.slice(idx, idx + term.length)}
        </mark>
        {text.slice(idx + term.length)}
      </>
    );
  };

  const renderWordCard = (w: any) => (
    <Card key={w.id} className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold font-display">
            {highlight(w.word, q)}
          </h3>
          {w.pronunciation && (
            <p className="text-xs text-muted-foreground">[{w.pronunciation}]</p>
          )}
          {w.part_of_speech && (
            <Badge variant="outline" className="text-xs mt-1">{w.part_of_speech}</Badge>
          )}
          {w.meaning_bn && (
            <p className="text-sm mt-2 leading-relaxed">{highlight(w.meaning_bn, q)}</p>
          )}
          {w.meaning_en && (
            <p className="text-xs text-muted-foreground italic mt-1">{w.meaning_en}</p>
          )}
          {w.example && (
            <p className="text-xs mt-2 border-l-2 border-primary/30 pl-2 italic text-muted-foreground">
              {w.example}
            </p>
          )}
          {w.source_name && (
            <p className="text-[10px] text-muted-foreground mt-2">উৎস: {w.source_name}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => toggleFav(w.id)}
        >
          <Star
            className={`h-4 w-4 ${favIds.has(w.id) ? "fill-yellow-400 text-yellow-400" : ""}`}
          />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-display font-black">অভিধান</h1>
            <p className="text-sm text-muted-foreground">
              বাংলা শব্দ ভান্ডার · সার্চ ও ফেভারিট সংগ্রহ
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/library"><BookOpen className="h-4 w-4 mr-1" /> লাইব্রেরি</Link>
          </Button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="শব্দ বা অক্ষর লিখুন..."
            className="pl-9 h-11 text-base"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-3">
            <TabsList>
              <TabsTrigger value="all">সব শব্দ ({words.length})</TabsTrigger>
              <TabsTrigger value="fav">ফেভারিট ({favorites.length})</TabsTrigger>
            </TabsList>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                downloadPdf(
                  activeTab === "fav" ? favorites.map((f: any) => f.dictionary_words) : words,
                  activeTab === "fav" ? "favorite-words" : "dictionary",
                )
              }
            >
              <Download className="h-4 w-4 mr-1" /> PDF
            </Button>
          </div>

          <TabsContent value="all">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p>
            ) : words.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {q ? "কোনো শব্দ পাওয়া যায়নি" : "এখনো কোনো শব্দ যোগ হয়নি"}
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">{words.map(renderWordCard)}</div>
            )}
          </TabsContent>

          <TabsContent value="fav">
            {favorites.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                ফেভারিট তালিকা খালি
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {favorites.map((f: any) => renderWordCard(f.dictionary_words))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dictionary;
