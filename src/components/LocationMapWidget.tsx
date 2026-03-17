import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type Level = "division" | "district" | "upazila";

const LocationMapWidget = () => {
  const [level, setLevel] = useState<Level>("division");
  const [selectedDivision, setSelectedDivision] = useState<{ id: string; name: string } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<{ id: string; name: string } | null>(null);

  const { data: divisions } = useQuery({
    queryKey: ["map-divisions"],
    queryFn: async () => {
      const { data } = await supabase.from("divisions").select("*").order("bn_name");
      return data || [];
    },
  });

  const { data: districts } = useQuery({
    queryKey: ["map-districts", selectedDivision?.id],
    queryFn: async () => {
      if (!selectedDivision) return [];
      const { data } = await supabase.from("districts").select("*").eq("division_id", selectedDivision.id).order("bn_name");
      return data || [];
    },
    enabled: !!selectedDivision,
  });

  const { data: upazilas } = useQuery({
    queryKey: ["map-upazilas", selectedDistrict?.id],
    queryFn: async () => {
      if (!selectedDistrict) return [];
      const { data } = await supabase.from("upazilas").select("*").eq("district_id", selectedDistrict.id).order("bn_name");
      return data || [];
    },
    enabled: !!selectedDistrict,
  });

  const divisionColors: Record<string, string> = {
    "ঢাকা": "hsl(var(--primary))",
    "চট্টগ্রাম": "#10b981",
    "রাজশাহী": "#f59e0b",
    "খুলনা": "#8b5cf6",
    "বরিশাল": "#ec4899",
    "সিলেট": "#06b6d4",
    "রংপুর": "#ef4444",
    "ময়মনসিংহ": "#f97316",
  };

  const goBack = () => {
    if (level === "upazila") {
      setLevel("district");
      setSelectedDistrict(null);
    } else if (level === "district") {
      setLevel("division");
      setSelectedDivision(null);
    }
  };

  const breadcrumb = () => {
    const parts: string[] = ["🇧🇩 বাংলাদেশ"];
    if (selectedDivision) parts.push(selectedDivision.name);
    if (selectedDistrict) parts.push(selectedDistrict.name);
    return parts;
  };

  return (
    <Card className="news-card">
      <CardHeader className="pb-2">
        <CardTitle className="section-title text-base !mb-0 flex items-center gap-1.5">
          <MapPin className="h-4 w-4" /> এলাকার খবর
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
          {breadcrumb().map((part, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              <button
                className={`hover:text-primary transition-colors ${i === breadcrumb().length - 1 ? "text-foreground font-medium" : ""}`}
                onClick={() => {
                  if (i === 0) { setLevel("division"); setSelectedDivision(null); setSelectedDistrict(null); }
                  else if (i === 1) { setLevel("district"); setSelectedDistrict(null); }
                }}
              >
                {part}
              </button>
            </span>
          ))}
        </div>

        {/* Back button */}
        {level !== "division" && (
          <button onClick={goBack} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <ChevronLeft className="h-3 w-3" /> পিছনে যান
          </button>
        )}

        {/* Divisions */}
        {level === "division" && (
          <div className="grid grid-cols-2 gap-1.5">
            {divisions?.map((d) => (
              <button
                key={d.id}
                onClick={() => { setSelectedDivision({ id: d.id, name: d.bn_name }); setLevel("district"); }}
                className="text-xs px-2.5 py-2 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all text-center font-medium group relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{ backgroundColor: divisionColors[d.bn_name] || "hsl(var(--primary))" }}
                />
                <div className="relative">
                  <div className="text-lg mb-0.5">📍</div>
                  <span>{d.bn_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Districts */}
        {level === "district" && (
          <div className="grid grid-cols-2 gap-1.5 max-h-[300px] overflow-y-auto scrollbar-hide">
            {districts?.map((d) => (
              <button
                key={d.id}
                onClick={() => { setSelectedDistrict({ id: d.id, name: d.bn_name }); setLevel("upazila"); }}
                className="text-xs px-2.5 py-1.5 rounded-md bg-muted/60 hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors text-center font-medium"
              >
                {d.bn_name}
              </button>
            ))}
          </div>
        )}

        {/* Upazilas */}
        {level === "upazila" && (
          <div className="grid grid-cols-2 gap-1.5 max-h-[300px] overflow-y-auto scrollbar-hide">
            {upazilas?.map((u) => (
              <div
                key={u.id}
                className="text-xs px-2.5 py-1.5 rounded-md bg-accent/50 hover:bg-accent cursor-pointer transition-colors text-center"
              >
                {u.bn_name}
              </div>
            ))}
            {(!upazilas || upazilas.length === 0) && (
              <p className="col-span-2 text-xs text-muted-foreground text-center py-2">কোনো উপজেলা নেই</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationMapWidget;
