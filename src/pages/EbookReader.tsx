import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";

const EbookReader = () => {
  const { id } = useParams();
  const { data: book, isLoading } = useQuery({
    queryKey: ["ebook", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("ebooks").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="border-b px-4 py-2 flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/library"><ArrowLeft className="h-4 w-4 mr-1" /> লাইব্রেরি</Link>
        </Button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{book?.title || "..."}</p>
          {book?.author && <p className="text-xs text-muted-foreground truncate">{book.author}</p>}
        </div>
        {book?.pdf_url && (
          <Button asChild size="sm" variant="outline">
            <a href={book.pdf_url} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-1" /> ডাউনলোড
            </a>
          </Button>
        )}
      </div>
      <div className="flex-1 bg-muted">
        {isLoading ? (
          <p className="text-center py-12 text-muted-foreground">লোড হচ্ছে...</p>
        ) : !book ? (
          <p className="text-center py-12 text-muted-foreground">বই পাওয়া যায়নি</p>
        ) : (
          <iframe
            src={`${book.pdf_url}#toolbar=1&navpanes=1`}
            className="w-full h-[calc(100vh-160px)]"
            title={book.title}
          />
        )}
      </div>
    </div>
  );
};

export default EbookReader;
