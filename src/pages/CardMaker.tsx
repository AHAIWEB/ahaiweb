import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "@/hooks/use-toast";

interface Ev { year: string; event: string }

export default function CardMaker() {
  const [params] = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<Ev[]>([]);
  const [title, setTitle] = useState("ইতিহাসে আজ");

  useEffect(() => {
    try {
      const raw = params.get("events");
      if (raw) setEvents(JSON.parse(decodeURIComponent(raw)));
      const t = params.get("title");
      if (t) setTitle(decodeURIComponent(t));
    } catch {}
  }, [params]);

  const todayBn = new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long" });

  const download = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = `ihihasey-aaj-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "কার্ড ডাউনলোড হয়েছে" });
    } catch (e: any) {
      toast({ title: "ডাউনলোড ব্যর্থ", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to="/"><ArrowLeft className="h-4 w-4" /> হোম</Link>
          </Button>
          <Button onClick={download}><Download className="h-4 w-4" /> PNG ডাউনলোড</Button>
        </div>

        <div ref={cardRef} className="relative overflow-hidden rounded-2xl p-8 md:p-10"
          style={{
            background: "linear-gradient(135deg, hsl(240 60% 12%) 0%, hsl(280 50% 15%) 50%, hsl(220 70% 10%) 100%)",
            color: "white",
            minHeight: 600,
          }}
        >
          {/* dot pattern overlay */}
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          {/* glow */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,180,80,0.3), transparent 70%)" }} />

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest opacity-70">AHAiWEB</p>
                <h1 className="text-3xl md:text-4xl font-bold mt-1">{title}</h1>
                <p className="text-base opacity-80 mt-1">{todayBn}</p>
              </div>
              <div className="text-5xl">📜</div>
            </div>

            <div className="relative pl-6 mt-8 space-y-5 border-l-2 border-dashed border-white/30">
              {events.length === 0 && <p className="opacity-70">কোনো ঘটনা নেই</p>}
              {events.map((e, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-400"
                    style={{ boxShadow: "0 0 16px rgba(255,180,80,0.9)" }} />
                  <div className="flex gap-3">
                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 h-fit whitespace-nowrap">
                      {e.year || "—"}
                    </span>
                    <p className="text-sm md:text-base leading-relaxed">{e.event}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs opacity-70">
              <span>ahaiweb.lovable.app</span>
              <span>© AHAiWEB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
