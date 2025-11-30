import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

function ProtectedRoute({ component: Component, requireSubscription = true }: { component: React.ComponentType; requireSubscription?: boolean }) {
  const { isAuthenticated, isLoading, hasSubscription } = useAuth();

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

  if (requireSubscription && !hasSubscription) {
    return <Redirect to="/subscription" />;
  }

  return <Component />;
}

function SubscriptionRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading, hasSubscription } = useAuth();

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

  if (hasSubscription) {
    return <Redirect to="/app" />;
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
