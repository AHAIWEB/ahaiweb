import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowUp, ArrowDown, Eye, EyeOff, Plus, Trash2, Save, GripVertical, Settings2, Megaphone,
} from "lucide-react";

interface SiteSection {
  id: string;
  section_key: string;
  label: string;
  icon: string | null;
  is_visible: boolean;
  sort_order: number;
  config: Record<string, any>;
}

const SiteCustomizer = () => {
  const { toast } = useToast();
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSection, setNewSection] = useState({ label: "", icon: "", section_key: "", type: "content" });

  const fetchSections = async () => {
    const { data } = await supabase
      .from("site_sections")
      .select("*")
      .order("sort_order");
    setSections((data as any as SiteSection[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchSections(); }, []);

  const updateSection = async (id: string, updates: Partial<SiteSection>) => {
    const { error } = await supabase
      .from("site_sections")
      .update(updates as any)
      .eq("id", id);
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      fetchSections();
    }
  };

  const moveSection = async (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) return;

    const a = sections[index];
    const b = sections[target];

    await Promise.all([
      supabase.from("site_sections").update({ sort_order: b.sort_order } as any).eq("id", a.id),
      supabase.from("site_sections").update({ sort_order: a.sort_order } as any).eq("id", b.id),
    ]);
    fetchSections();
  };

  const addSection = async () => {
    if (!newSection.label.trim()) return;
    const key = newSection.section_key || newSection.label.toLowerCase().replace(/\s+/g, "-");
    const maxOrder = Math.max(0, ...sections.map((s) => s.sort_order));

    const isAd = newSection.type === "ad";
    const { error } = await supabase.from("site_sections").insert({
      section_key: key,
      label: newSection.label,
      icon: newSection.icon || (isAd ? "📢" : "📄"),
      sort_order: maxOrder + 1,
      is_visible: !isAd,
      config: isAd ? { type: "ad", ad_code: "" } : {},
    } as any);

    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      setNewSection({ label: "", icon: "", section_key: "", type: "content" });
      fetchSections();
      toast({ title: "সেকশন যোগ হয়েছে" });
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm("এই সেকশন মুছে ফেলতে চান?")) return;
    await supabase.from("site_sections").delete().eq("id", id);
    fetchSections();
    toast({ title: "মুছে ফেলা হয়েছে" });
  };

  const updateAdCode = async (id: string, adCode: string) => {
    const section = sections.find((s) => s.id === id);
    if (!section) return;
    await updateSection(id, { config: { ...section.config, ad_code: adCode } } as any);
  };

  const updateLabel = async (id: string, label: string) => {
    await updateSection(id, { label });
    setEditingId(null);
  };

  if (loading) {
    return <div className="flex justify-center py-12 text-muted-foreground">লোড হচ্ছে...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings2 className="h-6 w-6" /> সাইট কাস্টমাইজার
        </h2>
        <Badge variant="outline" className="text-xs">
          {sections.filter((s) => s.is_visible).length}/{sections.length} সক্রিয়
        </Badge>
      </div>

      {/* Add new section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> নতুন সেকশন / বিজ্ঞাপন স্লট যোগ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <select
              className="h-9 px-3 rounded-md border border-input bg-background text-sm"
              value={newSection.type}
              onChange={(e) => setNewSection((p) => ({ ...p, type: e.target.value }))}
            >
              <option value="content">কনটেন্ট সেকশন</option>
              <option value="ad">বিজ্ঞাপন স্লট</option>
            </select>
            <Input
              placeholder="লেবেল"
              value={newSection.label}
              onChange={(e) => setNewSection((p) => ({ ...p, label: e.target.value }))}
              className="w-40"
            />
            <Input
              placeholder="আইকন (emoji)"
              value={newSection.icon}
              onChange={(e) => setNewSection((p) => ({ ...p, icon: e.target.value }))}
              className="w-24"
            />
            <Input
              placeholder="কী (ইংরেজি)"
              value={newSection.section_key}
              onChange={(e) => setNewSection((p) => ({ ...p, section_key: e.target.value }))}
              className="w-32"
            />
            <Button onClick={addSection} disabled={!newSection.label.trim()} size="sm">
              <Plus className="h-3.5 w-3.5 mr-1" /> যোগ
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sections list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">হোমপেজ সেকশন সমূহ (ড্র্যাগ করে সাজান)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sections.map((section, idx) => {
            const isAd = section.config?.type === "ad";
            return (
              <div
                key={section.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  section.is_visible
                    ? "border-border bg-card"
                    : "border-dashed border-muted-foreground/30 bg-muted/30 opacity-60"
                }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />

                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{section.icon}</span>
                    {editingId === section.id ? (
                      <Input
                        defaultValue={section.label}
                        className="h-7 text-sm w-48"
                        autoFocus
                        onBlur={(e) => updateLabel(section.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") updateLabel(section.id, e.currentTarget.value);
                        }}
                      />
                    ) : (
                      <span
                        className="text-sm font-medium cursor-pointer hover:text-primary"
                        onClick={() => setEditingId(section.id)}
                      >
                        {section.label}
                      </span>
                    )}
                    {isAd && (
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <Megaphone className="h-3 w-3" /> বিজ্ঞাপন
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {section.section_key}
                    </Badge>
                  </div>

                  {/* Ad code editor */}
                  {isAd && section.is_visible && (
                    <Textarea
                      placeholder="বিজ্ঞাপন কোড (HTML/JS) পেস্ট করুন..."
                      className="text-xs h-16 mt-1"
                      defaultValue={section.config?.ad_code || ""}
                      onBlur={(e) => updateAdCode(section.id, e.target.value)}
                    />
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Switch
                    checked={section.is_visible}
                    onCheckedChange={(v) => updateSection(section.id, { is_visible: v })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => moveSection(idx, "up")}
                    disabled={idx === 0}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => moveSection(idx, "down")}
                    disabled={idx === sections.length - 1}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => deleteSection(section.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Preview hint */}
      <Card className="border-dashed">
        <CardContent className="py-4 text-center text-sm text-muted-foreground">
          💡 সেকশনের ক্রম পরিবর্তন করলে হোমপেজে তা সাথে সাথে প্রতিফলিত হবে।
          বিজ্ঞাপন স্লটে Google AdSense বা কাস্টম HTML কোড যোগ করতে পারবেন।
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteCustomizer;
