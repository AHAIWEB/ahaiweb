import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, MapPin, Tag, X } from "lucide-react";

const TagManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newTag, setNewTag] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedUpazila, setSelectedUpazila] = useState("");
  const [newDistrict, setNewDistrict] = useState("");
  const [newDistrictBn, setNewDistrictBn] = useState("");
  const [newUpazila, setNewUpazila] = useState("");
  const [newUpazilaBn, setNewUpazilaBn] = useState("");
  const [newUnion, setNewUnion] = useState("");
  const [newUnionBn, setNewUnionBn] = useState("");

  // Queries
  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data } = await supabase.from("tags").select("*").order("name");
      return data || [];
    },
  });

  const { data: divisions } = useQuery({
    queryKey: ["divisions"],
    queryFn: async () => {
      const { data } = await supabase.from("divisions").select("*").order("bn_name");
      return data || [];
    },
  });

  const { data: districts } = useQuery({
    queryKey: ["districts", selectedDivision],
    queryFn: async () => {
      if (!selectedDivision) return [];
      const { data } = await supabase.from("districts").select("*").eq("division_id", selectedDivision).order("bn_name");
      return data || [];
    },
    enabled: !!selectedDivision,
  });

  const { data: upazilas } = useQuery({
    queryKey: ["upazilas", selectedDistrict],
    queryFn: async () => {
      if (!selectedDistrict) return [];
      const { data } = await supabase.from("upazilas").select("*").eq("district_id", selectedDistrict).order("bn_name");
      return data || [];
    },
    enabled: !!selectedDistrict,
  });

  const { data: unions } = useQuery({
    queryKey: ["unions", selectedUpazila],
    queryFn: async () => {
      if (!selectedUpazila) return [];
      const { data } = await supabase.from("unions").select("*").eq("upazila_id", selectedUpazila).order("bn_name");
      return data || [];
    },
    enabled: !!selectedUpazila,
  });

  const { data: tagLocations } = useQuery({
    queryKey: ["tag-locations", selectedTag],
    queryFn: async () => {
      if (!selectedTag) return [];
      const { data } = await supabase
        .from("tag_locations")
        .select("*, divisions(bn_name), districts(bn_name), upazilas(bn_name), unions(bn_name)")
        .eq("tag_id", selectedTag);
      return data || [];
    },
    enabled: !!selectedTag,
  });

  // Add tag
  const addTag = async () => {
    if (!newTag.trim()) return;
    const slug = newTag.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, "-");
    const { error } = await supabase.from("tags").insert({ name: newTag.trim(), slug });
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      setNewTag("");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast({ title: "ট্যাগ যোগ হয়েছে" });
    }
  };

  const deleteTag = async (id: string) => {
    if (!confirm("মুছে ফেলতে চান?")) return;
    await supabase.from("tags").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["tags"] });
    if (selectedTag === id) setSelectedTag(null);
  };

  // Add district
  const addDistrict = async () => {
    if (!newDistrict.trim() || !newDistrictBn.trim() || !selectedDivision) return;
    const { error } = await supabase.from("districts").insert({
      name: newDistrict.trim(), bn_name: newDistrictBn.trim(), division_id: selectedDivision,
    });
    if (!error) {
      setNewDistrict(""); setNewDistrictBn("");
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      toast({ title: "জেলা যোগ হয়েছে" });
    }
  };

  // Add upazila
  const addUpazila = async () => {
    if (!newUpazila.trim() || !newUpazilaBn.trim() || !selectedDistrict) return;
    const { error } = await supabase.from("upazilas").insert({
      name: newUpazila.trim(), bn_name: newUpazilaBn.trim(), district_id: selectedDistrict,
    });
    if (!error) {
      setNewUpazila(""); setNewUpazilaBn("");
      queryClient.invalidateQueries({ queryKey: ["upazilas"] });
      toast({ title: "উপজেলা যোগ হয়েছে" });
    }
  };

  // Add union
  const addUnion = async () => {
    if (!newUnion.trim() || !newUnionBn.trim() || !selectedUpazila) return;
    const { error } = await supabase.from("unions").insert({
      name: newUnion.trim(), bn_name: newUnionBn.trim(), upazila_id: selectedUpazila,
    });
    if (!error) {
      setNewUnion(""); setNewUnionBn("");
      queryClient.invalidateQueries({ queryKey: ["unions"] });
      toast({ title: "ইউনিয়ন যোগ হয়েছে" });
    }
  };

  // Map tag to location
  const mapTagToLocation = async () => {
    if (!selectedTag || !selectedDivision) return;
    const { error } = await supabase.from("tag_locations").insert({
      tag_id: selectedTag,
      division_id: selectedDivision || null,
      district_id: selectedDistrict || null,
      upazila_id: selectedUpazila || null,
    });
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["tag-locations"] });
      toast({ title: "ট্যাগ ম্যাপ হয়েছে" });
    } else {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    }
  };

  const removeTagLocation = async (id: string) => {
    await supabase.from("tag_locations").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["tag-locations"] });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">ট্যাগ ও লোকেশন ম্যানেজমেন্ট</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Tag className="h-4 w-4" /> ট্যাগ সমূহ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input placeholder="নতুন ট্যাগ" value={newTag} onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()} />
              <Button size="icon" onClick={addTag}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTag === tag.id ? "default" : "outline"}
                  className="cursor-pointer gap-1 pr-1"
                  onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                >
                  {tag.name}
                  <button onClick={(e) => { e.stopPropagation(); deleteTag(tag.id); }}
                    className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location Hierarchy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> লোকেশন</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Division */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">বিভাগ</label>
              <Select value={selectedDivision} onValueChange={(v) => { setSelectedDivision(v); setSelectedDistrict(""); setSelectedUpazila(""); }}>
                <SelectTrigger><SelectValue placeholder="বিভাগ নির্বাচন" /></SelectTrigger>
                <SelectContent>
                  {divisions?.map((d) => <SelectItem key={d.id} value={d.id}>{d.bn_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* District */}
            {selectedDivision && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">জেলা</label>
                <Select value={selectedDistrict} onValueChange={(v) => { setSelectedDistrict(v); setSelectedUpazila(""); }}>
                  <SelectTrigger><SelectValue placeholder="জেলা নির্বাচন" /></SelectTrigger>
                  <SelectContent>
                    {districts?.map((d) => <SelectItem key={d.id} value={d.id}>{d.bn_name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex gap-2 mt-2">
                  <Input placeholder="জেলা (EN)" value={newDistrict} onChange={(e) => setNewDistrict(e.target.value)} className="h-8 text-xs" />
                  <Input placeholder="জেলা (বাংলা)" value={newDistrictBn} onChange={(e) => setNewDistrictBn(e.target.value)} className="h-8 text-xs" />
                  <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={addDistrict}>যোগ</Button>
                </div>
              </div>
            )}

            {/* Upazila */}
            {selectedDistrict && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">উপজেলা</label>
                <Select value={selectedUpazila} onValueChange={setSelectedUpazila}>
                  <SelectTrigger><SelectValue placeholder="উপজেলা নির্বাচন" /></SelectTrigger>
                  <SelectContent>
                    {upazilas?.map((u) => <SelectItem key={u.id} value={u.id}>{u.bn_name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex gap-2 mt-2">
                  <Input placeholder="উপজেলা (EN)" value={newUpazila} onChange={(e) => setNewUpazila(e.target.value)} className="h-8 text-xs" />
                  <Input placeholder="উপজেলা (বাংলা)" value={newUpazilaBn} onChange={(e) => setNewUpazilaBn(e.target.value)} className="h-8 text-xs" />
                  <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={addUpazila}>যোগ</Button>
                </div>
              </div>
            )}

            {/* Union */}
            {selectedUpazila && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">ইউনিয়ন</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {unions?.map((u) => (
                    <Badge key={u.id} variant="outline" className="text-xs">{u.bn_name}</Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="ইউনিয়ন (EN)" value={newUnion} onChange={(e) => setNewUnion(e.target.value)} className="h-8 text-xs" />
                  <Input placeholder="ইউনিয়ন (বাংলা)" value={newUnionBn} onChange={(e) => setNewUnionBn(e.target.value)} className="h-8 text-xs" />
                  <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={addUnion}>যোগ</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tag-Location Mapping */}
      {selectedTag && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              🗺️ ট্যাগ ম্যাপিং: <Badge>{tags?.find(t => t.id === selectedTag)?.name}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 items-end">
              <p className="text-sm text-muted-foreground">উপরে লোকেশন সিলেক্ট করে ম্যাপ করুন →</p>
              <Button size="sm" onClick={mapTagToLocation} disabled={!selectedDivision}>
                <MapPin className="h-3 w-3 mr-1" /> ম্যাপ করুন
              </Button>
            </div>

            {tagLocations && tagLocations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">ম্যাপড লোকেশন:</p>
                {tagLocations.map((tl: any) => (
                  <div key={tl.id} className="flex items-center justify-between bg-muted rounded-md px-3 py-2">
                    <span className="text-sm">
                      {tl.divisions?.bn_name || ""}
                      {tl.districts?.bn_name ? ` → ${tl.districts.bn_name}` : ""}
                      {tl.upazilas?.bn_name ? ` → ${tl.upazilas.bn_name}` : ""}
                      {tl.unions?.bn_name ? ` → ${tl.unions.bn_name}` : ""}
                    </span>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeTagLocation(tl.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TagManager;
