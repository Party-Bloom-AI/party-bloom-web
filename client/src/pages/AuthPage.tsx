import { Redirect } from "wouter";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@assets/logo-trademark_1764496936402.png";

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  
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
        <div className="w-full max-w-md" data-testid="card-auth">
          {isSignUp ? (
            <SignUp 
              signInUrl="/auth"
              forceRedirectUrl="/app"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-lg border rounded-lg",
                  headerTitle: "text-2xl font-bold",
                  headerSubtitle: "text-muted-foreground",
                  formButtonPrimary: "bg-primary hover:bg-primary/90",
                  footerActionLink: "text-primary hover:text-primary/80",
                }
              }}
            />
          ) : (
            <SignIn 
              signUpUrl="/auth"
              forceRedirectUrl="/app"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-lg border rounded-lg",
                  headerTitle: "text-2xl font-bold",
                  headerSubtitle: "text-muted-foreground",
                  formButtonPrimary: "bg-primary hover:bg-primary/90",
                  footerActionLink: "text-primary hover:text-primary/80",
                }
              }}
            />
          )}
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
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
        </div>
      </div>
    </div>
  );
}
