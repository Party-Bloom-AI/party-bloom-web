import { useState } from "react";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock, User, ArrowRight, Shield } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@assets/logo-trademark_1764496936402.png";

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Redirect to="/app" />;
  }

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (isSignUp && !formData.name.trim()) {
      newErrors.name = "Please enter your name";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Please enter a password";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    window.location.href = "/api/login";
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:flex-1 bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6 lg:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto lg:mx-0 lg:ml-auto lg:mr-16">
          <div className="flex items-center gap-3 mb-8">
            <img src={logoImage} alt="Party Bloom" className="h-10 w-auto" />
            <span className="text-xl font-bold">Party Bloom</span>
          </div>

          <div className="space-y-6 hidden lg:block">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Planning</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
              From idea to shoppable party decoration plan in under 10 minutes.
            </h1>

            <p className="text-lg text-muted-foreground">
              Join thousands of busy parents who've discovered the stress-free way to plan memorable birthday celebrations.
            </p>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-background"
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">2,000+</span> happy parents
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md p-8" data-testid="card-auth">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" data-testid="text-auth-title">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-muted-foreground">
              {isSignUp
                ? "Start planning magical parties today"
                : "Sign in to continue planning"}
            </p>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full mb-6 py-6 h-auto"
            onClick={handleGoogleLogin}
            data-testid="button-google-login"
          >
            <SiGoogle className="mr-3 h-5 w-5" />
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
                    data-testid="input-name"
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive" data-testid="error-name">
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                  data-testid="input-email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive" data-testid="error-email">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
                  data-testid="input-password"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive" data-testid="error-password">
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full py-6 h-auto"
              disabled={isSubmitting}
              data-testid="button-submit"
            >
              {isSubmitting ? "Please wait..." : "Continue"}
              {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-toggle-mode"
            >
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <span className="text-primary font-medium">Sign in</span>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <span className="text-primary font-medium">Sign up</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t">
            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <Shield className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
              <p>
                Your privacy matters. We never share your data or send spam. 
                Your email is only used for account-related communications.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
