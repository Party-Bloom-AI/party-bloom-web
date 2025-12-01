import { useQuery } from "@tanstack/react-query";
import type { User, Subscription } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

type UserWithSubscription = User & { subscription?: Subscription | null };

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

export function useAuth() {
  const { data: user, isLoading: userLoading } = useQuery<UserWithSubscription | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const { data: accessStatus, isLoading: accessLoading } = useQuery<AccessStatus | null>({
    queryKey: ["/api/access-status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    enabled: !!user,
    staleTime: 30000,
  });

  // Compute loading state carefully
  const isLoading = userLoading || (!!user && accessLoading);
  
  // User has access if they have a free trial or active subscription
  const hasAccess = accessStatus?.hasAccess ?? false;
  const isInFreeTrial = accessStatus?.accessType === 'free_trial';
  const hasSubscription = accessStatus?.accessType === 'subscription' || !!user?.subscription;
  const subscriptionStatus = user?.subscription?.status || null;
  const trialDaysRemaining = accessStatus?.daysRemaining ?? 0;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasAccess,
    hasSubscription,
    isInFreeTrial,
    trialDaysRemaining,
    subscriptionStatus,
    subscription: user?.subscription,
    accessStatus,
  };
}
