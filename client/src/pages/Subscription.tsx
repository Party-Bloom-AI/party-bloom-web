import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PartyPopper, Check, CreditCard, Sparkles, X, LogOut, Gift, Clock, ArrowRight } from "lucide-react";

interface AccessStatus {
  hasAccess: boolean;
  accessType: 'subscription' | 'free_trial' | 'expired';
  trialEndsAt?: string;
  daysRemaining?: number;
  status?: string;
  expiresAt?: string;
  trialEndedAt?: string;
  requiresSubscription?: boolean;
}

export default function Subscription() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: accessStatus, isLoading: accessLoading } = useQuery<AccessStatus>({
    queryKey: ['/api/access-status'],
    enabled: !!user,
  });

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

  const handleSubscribe = () => {
    createCheckoutMutation.mutate();
  };

  const handleContinue = () => {
    setLocation("/");
  };

  if (authLoading || accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isInFreeTrial = accessStatus?.accessType === 'free_trial';
  const trialExpired = accessStatus?.accessType === 'expired';
  const hasSubscription = accessStatus?.accessType === 'subscription';

  // If user already has active subscription, redirect to dashboard
  if (hasSubscription) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <PartyPopper className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isInFreeTrial ? "Welcome to Party Bloom!" : "Unlock Party Bloom"}
          </h1>
          <p className="text-muted-foreground">
            {user?.firstName ? `Hi ${user.firstName}!` : "Welcome!"}{" "}
            {isInFreeTrial 
              ? "Enjoy your free trial - no payment required." 
              : "Subscribe to continue creating amazing party themes."}
          </p>
        </div>

        {isInFreeTrial && (
          <Card className="p-8 mb-6 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Gift className="h-4 w-4" />
                Free Trial Active
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Your First Month is FREE!</h2>
              
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-4">
                <Clock className="h-5 w-5" />
                <span className="text-lg font-medium">
                  {accessStatus?.daysRemaining} days remaining
                </span>
              </div>
              
              <p className="text-muted-foreground mb-6">
                No payment information required. Create unlimited party themes, 
                save your favorites, and explore all features during your trial.
              </p>

              <div className="space-y-3 text-left mb-8 max-w-sm mx-auto">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Unlimited AI-powered theme generations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Beautiful moodboards with 4 curated images</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Smart shopping lists with retailer links</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span>100+ preset theme templates</span>
                </div>
              </div>

              <Button 
                onClick={handleContinue}
                className="w-full h-12 text-lg"
                data-testid="button-start-trial"
              >
                Start Planning Parties
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        )}

        {trialExpired && (
          <Card className="p-8 mb-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Clock className="h-4 w-4" />
                Free Trial Ended
              </div>
              <h2 className="text-2xl font-bold mb-2">Continue with Party Bloom</h2>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">$20</span>
                <span className="text-muted-foreground">CAD/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Unlimited access to all features
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
                  <p className="font-medium mb-1">Secure Payment via Stripe</p>
                  <p className="text-muted-foreground">
                    Your payment is processed securely. Cancel anytime from your billing settings.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleSubscribe}
                disabled={createCheckoutMutation.isPending}
                className="w-full h-12 text-lg"
                data-testid="button-subscribe"
              >
                {createCheckoutMutation.isPending ? (
                  "Redirecting to payment..."
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Subscribe Now
                  </>
                )}
              </Button>
              
              <Button 
                variant="ghost"
                onClick={handleLogout}
                className="w-full text-muted-foreground"
                data-testid="button-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </Card>
        )}

        {/* Show subscription option for trial users who want to upgrade early */}
        {isInFreeTrial && (
          <Card className="p-6 bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Ready to subscribe early?</h3>
                <p className="text-sm text-muted-foreground">
                  $20 CAD/month after your trial ends
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={handleSubscribe}
                disabled={createCheckoutMutation.isPending}
                data-testid="button-subscribe-early"
              >
                {createCheckoutMutation.isPending ? "Loading..." : "Subscribe Now"}
              </Button>
            </div>
          </Card>
        )}

        <div className="flex items-center justify-center gap-4 mt-6">
          <Button 
            variant="ghost"
            onClick={handleLogout}
            className="text-muted-foreground"
            data-testid="button-signout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}
