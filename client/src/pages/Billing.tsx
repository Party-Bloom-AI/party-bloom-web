import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  CreditCard, 
  Calendar, 
  ChevronLeft, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { format } from "date-fns";

export default function Billing() {
  const { user, subscription, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const createPortalMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/subscription/create-portal");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const getStatusBadge = () => {
    if (!subscription) return null;

    const status = subscription.status;
    
    if (status === "trialing") {
      return (
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
          <Clock className="h-4 w-4" />
          Free Trial
        </div>
      );
    }
    
    if (status === "active") {
      return (
        <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          Active
        </div>
      );
    }
    
    if (status === "canceled" || status === "past_due") {
      return (
        <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium">
          <AlertCircle className="h-4 w-4" />
          {status === "canceled" ? "Cancelled" : "Past Due"}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/app")}
          className="mb-6"
          data-testid="button-back-to-dashboard"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your Party Bloom subscription and payment methods.
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Party Bloom Monthly</h2>
              <p className="text-muted-foreground text-sm">$20 CAD/month</p>
            </div>
            {getStatusBadge()}
          </div>

          {subscription && (
            <div className="space-y-4 border-t pt-4">
              {subscription.status === "trialing" && subscription.currentPeriodEnd && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Free trial ends on{" "}
                    <span className="font-medium">
                      {format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")}
                    </span>
                  </span>
                </div>
              )}

              {subscription.status === "active" && subscription.currentPeriodEnd && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {subscription.cancelAtPeriodEnd ? (
                      <>
                        Subscription ends on{" "}
                        <span className="font-medium">
                          {format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")}
                        </span>
                      </>
                    ) : (
                      <>
                        Next billing date:{" "}
                        <span className="font-medium">
                          {format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")}
                        </span>
                      </>
                    )}
                  </span>
                </div>
              )}

              {subscription.cancelAtPeriodEnd && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Your subscription is set to cancel at the end of the current billing period.
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Manage Subscription</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Update your payment method, view invoices, or cancel your subscription through our secure billing portal.
          </p>
          <Button
            onClick={() => createPortalMutation.mutate()}
            disabled={createPortalMutation.isPending || !user?.stripeCustomerId}
            data-testid="button-manage-billing"
          >
            {createPortalMutation.isPending ? (
              "Opening portal..."
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Billing Portal
              </>
            )}
          </Button>
        </Card>
      </div>
    </div>
  );
}
