import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);

    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else if (isSignUp) {
      toast({ title: "সফল", description: "অ্যাকাউন্ট তৈরি হয়েছে! ইমেইল যাচাই করুন।" });
    } else {
      navigate("/admin");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display">
            <span className="text-primary">AHAi</span>WEB
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {isSignUp ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "অ্যাডমিন লগইন"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="ইমেইল"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="পাসওয়ার্ড"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "অপেক্ষা করুন..." : isSignUp ? "সাইন আপ" : "লগইন"}
            </Button>
          </form>
          <Button
            variant="link"
            className="w-full mt-2 text-sm"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "আগে থেকে অ্যাকাউন্ট আছে? লগইন করুন" : "নতুন অ্যাকাউন্ট তৈরি করুন"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
