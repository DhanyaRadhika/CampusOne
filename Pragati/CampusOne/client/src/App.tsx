import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { EventsProvider } from "@/lib/events-context";
import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";
import StudentDashboard from "@/pages/student-dashboard";
import FacultyDashboard from "@/pages/faculty-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";

function ProtectedRoute({
  component: Component,
  allowedRole,
}: {
  component: any;
  allowedRole?: string;
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) return <div>Loading...</div>;

  if (!user) {
    setLocation("/auth");
    return null;
  }

  if (allowedRole && user.role !== allowedRole) {
    setLocation("/"); // Or unauthorized page
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={AuthPage} />

        <Route path="/student">
          {() => (
            <ProtectedRoute
              component={StudentDashboard}
              allowedRole="student"
            />
          )}
        </Route>

        <Route path="/faculty">
          {() => (
            <ProtectedRoute
              component={FacultyDashboard}
              allowedRole="faculty"
            />
          )}
        </Route>

        <Route path="/admin">
          {() => (
            <ProtectedRoute component={AdminDashboard} allowedRole="admin" />
          )}
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <EventsProvider>
          <Router />
          <Toaster />
        </EventsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
