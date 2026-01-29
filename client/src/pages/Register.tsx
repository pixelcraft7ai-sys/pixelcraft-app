import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Code2, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Register() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const { register } = useAuth();
  const isRTL = i18n.language === "ar";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const success = await register(email, password, name);
      if (success) {
        setLocation("/");
      } else {
        setError(isRTL ? "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى." : "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || (isRTL ? "حدث خطأ غير متوقع." : "An unexpected error occurred."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 ${isRTL ? "rtl" : "ltr"}`}>
      <Card className="w-full max-w-md bg-slate-900/80 border-purple-500/30 backdrop-blur-xl text-white">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">{t("auth.signUp")}</CardTitle>
          <CardDescription className="text-gray-400">
            {isRTL ? "أنشئ حساباً جديداً للبدء في استخدام PixelCraft" : "Create a new account to start using PixelCraft"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">{isRTL ? "الاسم" : "Name"}</Label>
              <Input
                id="name"
                type="text"
                placeholder={isRTL ? "أدخل اسمك" : "Enter your name"}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-800/50 border-purple-500/20 focus:border-purple-500/50 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{isRTL ? "البريد الإلكتروني" : "Email"}</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800/50 border-purple-500/20 focus:border-purple-500/50 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{isRTL ? "كلمة المرور" : "Password"}</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800/50 border-purple-500/20 focus:border-purple-500/50 text-white"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("auth.signUp")}
            </Button>
            <div className="text-center text-sm text-gray-400">
              {isRTL ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                {t("auth.signIn")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
