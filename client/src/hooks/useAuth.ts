import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

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
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const { getToken } = useClerkAuth();

  useEffect(() => {
    if (clerkLoaded && isSignedIn && clerkUser) {
      apiRequest("POST", "/api/auth/sync-user", {
        email: clerkUser.primaryEmailAddress?.emailAddress || null,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      }).catch(console.error);
    }
  }, [clerkLoaded, isSignedIn, clerkUser]);

  const { data: accessStatus, isLoading: accessLoading } = useQuery<AccessStatus | null>({
    queryKey: ["/api/access-status"],
    enabled: !!isSignedIn,
    staleTime: 30000,
  });

  const isLoading = !clerkLoaded || (isSignedIn && accessLoading);
  
  const hasAccess = accessStatus?.hasAccess ?? false;
  const isInFreeTrial = accessStatus?.accessType === 'free_trial';
  const hasSubscription = accessStatus?.accessType === 'subscription';
  const trialDaysRemaining = accessStatus?.daysRemaining ?? 0;

  const user = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || null,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    profileImageUrl: clerkUser.imageUrl,
  } : null;

  return {
    user,
    isLoading,
    isAuthenticated: !!isSignedIn,
    hasAccess,
    hasSubscription,
    isInFreeTrial,
    trialDaysRemaining,
    subscriptionStatus: null,
    subscription: null,
    accessStatus,
  };
}
