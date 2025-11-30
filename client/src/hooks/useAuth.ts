import { useQuery } from "@tanstack/react-query";
import type { User, Subscription } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

type UserWithSubscription = User & { subscription?: Subscription | null };

export function useAuth() {
  const { data: user, isLoading } = useQuery<UserWithSubscription | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const hasSubscription = !!user?.subscription;
  const subscriptionStatus = user?.subscription?.status || null;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasSubscription,
    subscriptionStatus,
    subscription: user?.subscription,
  };
}
