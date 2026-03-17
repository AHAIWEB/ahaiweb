import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, MapPin, Tag, FolderOpen } from "lucide-react";

interface PostTagLocationPickerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  selectedCategories: string[];
  onCategoriesChange: (cats: string[]) => void;
  selectedDivision: string;
  onDivisionChange: (v: string) => void;
  selectedDistrict: string;
  onDistrictChange: (v: string) => void;
  selectedUpazila: string;
  onUpazilaChange: (v: string) => void;
}

const PostTagLocationPicker = ({
  selectedTags,
  onTagsChange,
  selectedCategories,
  onCategoriesChange,
  selectedDivision,
  onDivisionChange,
  selectedDistrict,
  onDistrictChange,
  selectedUpazila,
  onUpazilaChange,
}: PostTagLocationPickerProps) => {
  const [tagInput, setTagInput] = useState("");

  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data } = await supabase.from("tags").select("*").order("name");
      return data || [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
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

  const addTag = (tagId: string) => {
    if (!selectedTags.includes(tagId)) onTagsChange([...selectedTags, tagId]);
  };

  const removeTag = (tagId: string) => onTagsChange(selectedTags.filter((t) => t !== tagId));

  const addCategory = (catId: string) => {
    if (!selectedCategories.includes(catId)) onCategoriesChange([...selectedCategories, catId]);
  };

  const removeCategory = (catId: string) => onCategoriesChange(selectedCategories.filter((c) => c !== catId));

  const filteredTags = tags?.filter(
    (t) => !selectedTags.includes(t.id) && (tagInput ? t.name.toLowerCase().includes(tagInput.toLowerCase()) : true)
  );

  const filteredCategories = categories?.filter((c) => !selectedCategories.includes(c.id));

  return (
    <div className="space-y-4">
      {/* Multiple Labels/Categories */}
      <div>
        <label className="text-sm font-medium mb-2 flex items-center gap-1.5">
          <FolderOpen className="h-3.5 w-3.5" /> লেবেল সমূহ
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedCategories.map((catId) => {
            const cat = categories?.find((c) => c.id === catId);
            return (
              <Badge key={catId} variant="default" className="gap-1 pr-1" style={cat?.color ? { backgroundColor: cat.color } : {}}>
                {cat?.icon} {cat?.name || catId}
                <button onClick={() => removeCategory(catId)} className="ml-0.5 hover:text-destructive-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
        <Select onValueChange={addCategory}>
          <SelectTrigger>
            <SelectValue placeholder="লেবেল যোগ করুন" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </SelectItem>
            ))}
            {(!filteredCategories || filteredCategories.length === 0) && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">কোনো লেবেল নেই</div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-medium mb-2 flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5" /> ট্যাগ সমূহ
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedTags.map((tagId) => {
            const tag = tags?.find((t) => t.id === tagId);
            return (
              <Badge key={tagId} variant="secondary" className="gap-1 pr-1">
                {tag?.name || tagId}
                <button onClick={() => removeTag(tagId)} className="ml-0.5 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
        <Select onValueChange={addTag}>
          <SelectTrigger>
            <SelectValue placeholder="ট্যাগ যোগ করুন" />
          </SelectTrigger>
          <SelectContent>
            {filteredTags?.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>{tag.name}</SelectItem>
            ))}
            {(!filteredTags || filteredTags.length === 0) && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">কোনো ট্যাগ নেই</div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div>
        <label className="text-sm font-medium mb-2 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> লোকেশন
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Select value={selectedDivision} onValueChange={(v) => { onDivisionChange(v); onDistrictChange(""); onUpazilaChange(""); }}>
            <SelectTrigger><SelectValue placeholder="বিভাগ" /></SelectTrigger>
            <SelectContent>
              {divisions?.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.bn_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDistrict} onValueChange={(v) => { onDistrictChange(v); onUpazilaChange(""); }} disabled={!selectedDivision}>
            <SelectTrigger><SelectValue placeholder="জেলা" /></SelectTrigger>
            <SelectContent>
              {districts?.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.bn_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedUpazila} onValueChange={onUpazilaChange} disabled={!selectedDistrict}>
            <SelectTrigger><SelectValue placeholder="উপজেলা" /></SelectTrigger>
            <SelectContent>
              {upazilas?.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.bn_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedDivision && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 text-xs h-6"
            onClick={() => { onDivisionChange(""); onDistrictChange(""); onUpazilaChange(""); }}
          >
            <X className="h-3 w-3 mr-1" /> লোকেশন মুছুন
          </Button>
        )}
      </div>
    </div>
  );
};

export default PostTagLocationPicker;
