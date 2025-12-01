import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/Home";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import LogoutPage from "@/pages/LogoutPage";
import Subscription from "@/pages/Subscription";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import SubscriptionCancel from "@/pages/SubscriptionCancel";
import Billing from "@/pages/Billing";
import NotFound from "@/pages/not-found";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function ProtectedRoute({ component: Component, requireAccess = true }: { component: React.ComponentType; requireAccess?: boolean }) {
  const { isAuthenticated, isLoading, hasAccess } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  if (requireAccess && !hasAccess) {
    return <Redirect to="/subscription" />;
  }

  return <Component />;
}

function SubscriptionRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}

function Router() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/app">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/subscription">
        <SubscriptionRoute component={Subscription} />
      </Route>
      <Route path="/subscription/success" component={SubscriptionSuccess} />
      <Route path="/subscription/cancel" component={SubscriptionCancel} />
      <Route path="/billing">
        <ProtectedRoute component={Billing} />
      </Route>
      <Route path="/logout" component={LogoutPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-destructive mb-2">Configuration Error</h1>
          <p className="text-muted-foreground">
            VITE_CLERK_PUBLISHABLE_KEY is not set. Please add it to your environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
