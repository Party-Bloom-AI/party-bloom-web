import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PartyPopper, Check, CreditCard, Sparkles, X, LogOut } from "lucide-react";

export default function Subscription() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const createCheckoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/subscription/create-checkout");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const handleLogout = () => {
    setLocation("/logout");
  };

  const handleProceed = () => {
    createCheckoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <PartyPopper className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Party Bloom!</h1>
          <p className="text-muted-foreground">
            {user?.firstName ? `Hi ${user.firstName}, let's` : "Let's"} get you started with your subscription.
          </p>
        </div>

        <Card className="p-8 mb-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Special Offer: First Month FREE
            </div>
            <h2 className="text-2xl font-bold mb-2">Party Bloom Monthly</h2>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold">$2</span>
              <span className="text-muted-foreground">CAD/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              after your 30-day free trial
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span>Unlimited AI-powered theme generations</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span>Beautiful moodboards with 4 curated images</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span>Smart shopping lists with retailer links</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span>100+ preset theme templates</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span>Save unlimited favorite themes</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Payment Information Required</p>
                <p className="text-muted-foreground">
                  To start your free trial, we'll need your payment details. You won't be charged until after your 30-day trial ends. Cancel anytime before then to avoid charges.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleProceed}
              disabled={createCheckoutMutation.isPending}
              className="w-full h-12 text-lg"
              data-testid="button-proceed-subscription"
            >
              {createCheckoutMutation.isPending ? (
                "Redirecting to payment..."
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Start Free Trial
                </>
              )}
            </Button>
            
            <Button 
              variant="ghost"
              onClick={handleLogout}
              className="w-full text-muted-foreground"
              data-testid="button-cancel-subscription"
            >
              <X className="mr-2 h-4 w-4" />
              No thanks, sign me out
            </Button>
          </div>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          By proceeding, you agree to our terms of service and privacy policy.
          You can cancel your subscription at any time from your billing settings.
        </p>
      </div>
    </div>
  );
}
