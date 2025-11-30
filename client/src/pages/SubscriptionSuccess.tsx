import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"confirming" | "success" | "error">("confirming");
  const [errorMessage, setErrorMessage] = useState("");

  const confirmMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest("POST", "/api/subscription/confirm", { sessionId });
      return response.json();
    },
    onSuccess: () => {
      setStatus("success");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setTimeout(() => {
        setLocation("/app");
      }, 2000);
    },
    onError: (error: any) => {
      setStatus("error");
      setErrorMessage(error.message || "Failed to confirm subscription");
    },
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");

    if (sessionId) {
      confirmMutation.mutate(sessionId);
    } else {
      setStatus("error");
      setErrorMessage("No session ID found");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Card className="p-8 max-w-md text-center">
        {status === "confirming" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Confirming your subscription...</h2>
            <p className="text-muted-foreground">Please wait while we set up your account.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Welcome to Party Bloom!</h2>
            <p className="text-muted-foreground">
              Your subscription is active. Redirecting to your dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">!</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <button
              onClick={() => setLocation("/subscription")}
              className="text-primary hover:underline"
            >
              Try again
            </button>
          </>
        )}
      </Card>
    </div>
  );
}
