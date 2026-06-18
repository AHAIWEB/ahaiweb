import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: "পাঠানো হয়েছে", description: "ইমেইল চেক করুন।" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display">পাসওয়ার্ড ভুলে গেছেন?</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">ইমেইল দিন, রিসেট লিংক পাঠানো হবে।</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <p className="text-sm text-center text-muted-foreground">
              ✅ {email} এ রিসেট লিংক পাঠানো হয়েছে। ইমেইল চেক করুন (স্প্যাম ফোল্ডারও)।
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input type="email" placeholder="ইমেইল" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "পাঠানো হচ্ছে..." : "রিসেট লিংক পাঠান"}
              </Button>
            </form>
          )}
          <Link to="/login" className="block text-center text-sm text-primary hover:underline">
            ← লগইন পেজে ফিরুন
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
