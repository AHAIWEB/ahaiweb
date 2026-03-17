import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Link2, Plus, Loader2 } from "lucide-react";

export interface ImageItem {
  type: "file" | "url";
  file?: File;
  url?: string;
  caption: string;
  preview: string;
}

interface MultiImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  label?: string;
  maxSize?: number; // thumbnail size in px
}

const MultiImageUploader = ({ images, onChange, label = "ছবি যোগ করুন", maxSize = 24 }: MultiImageUploaderProps) => {
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [loadingUrl, setLoadingUrl] = useState(false);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newItems: ImageItem[] = Array.from(e.target.files).map((file) => ({
      type: "file" as const,
      file,
      caption: "",
      preview: URL.createObjectURL(file),
    }));
    onChange([...images, ...newItems]);
    e.target.value = "";
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;
    setLoadingUrl(true);
    const item: ImageItem = {
      type: "url",
      url: urlInput.trim(),
      caption: "",
      preview: urlInput.trim(),
    };
    onChange([...images, item]);
    setUrlInput("");
    setShowUrlInput(false);
    setLoadingUrl(false);
  };

  const removeImage = (idx: number) => {
    const updated = images.filter((_, i) => i !== idx);
    onChange(updated);
  };

  const updateCaption = (idx: number, caption: string) => {
    const updated = images.map((img, i) => (i === idx ? { ...img, caption } : img));
    onChange(updated);
  };

  const sizeClass = `w-${maxSize} h-${maxSize}`;

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative" style={{ width: maxSize * 4, minWidth: 80 }}>
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={img.preview}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
              {img.type === "url" && (
                <span className="absolute bottom-0.5 left-0.5 bg-background/80 text-[9px] px-1 rounded text-foreground">
                  <Link2 className="h-2.5 w-2.5 inline" /> URL
                </span>
              )}
            </div>
            <Input
              placeholder="ক্যাপশন"
              className="mt-1 h-6 text-xs"
              value={img.caption}
              onChange={(e) => updateCaption(i, e.target.value)}
            />
          </div>
        ))}

        {/* File upload button */}
        <label
          className="border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors aspect-square"
          style={{ width: maxSize * 4, minWidth: 80 }}
        >
          <ImagePlus className="h-6 w-6 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground mt-1">ফাইল</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileAdd} />
        </label>

        {/* URL add button */}
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary transition-colors aspect-square"
          style={{ width: maxSize * 4, minWidth: 80 }}
        >
          <Link2 className="h-6 w-6 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground mt-1">URL</span>
        </button>
      </div>

      {/* URL input row */}
      {showUrlInput && (
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="ছবির URL পেস্ট করুন (https://...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlAdd()}
            className="flex-1 h-8 text-xs"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1"
            onClick={handleUrlAdd}
            disabled={loadingUrl || !urlInput.trim()}
          >
            {loadingUrl ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            যোগ
          </Button>
        </div>
      )}
    </div>
  );
};

export default MultiImageUploader;
