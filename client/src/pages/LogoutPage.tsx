import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Home, PartyPopper } from "lucide-react";
import logoImage from "@assets/logo_1764136309223.png";

export default function LogoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Card className="relative max-w-md w-full p-8 md:p-12 text-center" data-testid="card-logout">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-6">
            <PartyPopper className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-3" data-testid="text-logout-title">
            See You Soon!
          </h1>
          
          <p className="text-muted-foreground text-lg">
            You've been successfully logged out. Thanks for planning parties with us!
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/">
            <Button
              size="lg"
              className="w-full py-6 h-auto text-base gap-2"
              data-testid="button-back-home"
            >
              <Home className="h-5 w-5" />
              Back to Home
            </Button>
          </Link>

          <Link href="/auth">
            <Button
              size="lg"
              variant="outline"
              className="w-full py-6 h-auto text-base gap-2"
              data-testid="button-sign-in-again"
            >
              <Sparkles className="h-5 w-5" />
              Sign In Again
            </Button>
          </Link>
        </div>

        <div className="mt-10 pt-6 border-t">
          <Link href="/">
            <img 
              src={logoImage} 
              alt="Party Bloom" 
              className="h-8 mx-auto opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              data-testid="logo-footer"
            />
          </Link>
          <p className="text-sm text-muted-foreground mt-3">
            Creating magical birthday moments, one party at a time.
          </p>
        </div>
      </Card>
    </div>
  );
}
