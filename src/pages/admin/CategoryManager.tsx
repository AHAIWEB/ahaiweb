import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  sort_order: number | null;
}

const CategoryManager = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", icon: "", color: "#e11d48", sort_order: 0 });

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const generateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-").replace(/[^\u0980-\u09FFa-z0-9-]/g, "");

  const resetForm = () => {
    setForm({ name: "", slug: "", icon: "", color: "#e11d48", sort_order: 0 });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const slug = form.slug || generateSlug(form.name);
    const payload = { name: form.name, slug, icon: form.icon || null, color: form.color || null, sort_order: form.sort_order };

    if (editingId) {
      const { error } = await supabase.from("categories").update(payload).eq("id", editingId);
      if (error) { toast({ title: "ত্রুটি", description: error.message, variant: "destructive" }); return; }
      toast({ title: "আপডেট হয়েছে" });
    } else {
      const { error } = await supabase.from("categories").insert(payload);
      if (error) { toast({ title: "ত্রুটি", description: error.message, variant: "destructive" }); return; }
      toast({ title: "ক্যাটেগরি তৈরি হয়েছে" });
    }
    resetForm();
    fetchCategories();
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || "", color: cat.color || "#e11d48", sort_order: cat.sort_order || 0 });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast({ title: "ত্রুটি", description: error.message, variant: "destructive" }); return; }
    toast({ title: "মুছে ফেলা হয়েছে" });
    fetchCategories();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-bold">ক্যাটেগরি ম্যানেজমেন্ট</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{editingId ? "সম্পাদনা" : "নতুন ক্যাটেগরি"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="নাম" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: generateSlug(e.target.value) }))} />
            <Input placeholder="স্লাগ" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="আইকন (emoji)" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} />
            <div className="flex items-center gap-2">
              <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="h-10 w-10 rounded cursor-pointer border-0" />
              <Input value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="flex-1" />
            </div>
            <Input type="number" placeholder="ক্রম" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gap-1.5">
              {editingId ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {editingId ? "আপডেট" : "যোগ করুন"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}><X className="h-3.5 w-3.5 mr-1" /> বাতিল</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">সকল ক্যাটেগরি ({categories.length})</CardTitle></CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">কোনো ক্যাটেগরি নেই</p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{cat.icon || "📁"}</span>
                    <div>
                      <p className="text-sm font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                    </div>
                    {cat.color && (
                      <Badge variant="outline" className="text-xs" style={{ borderColor: cat.color, color: cat.color }}>
                        {cat.color}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(cat)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryManager;
