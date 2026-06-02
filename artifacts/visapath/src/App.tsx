import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/pages/LandingPage";
import AssessmentPage from "@/pages/AssessmentPage";
import ResultsPage from "@/pages/ResultsPage";
import AdvisorPage from "@/pages/AdvisorPage";
import RoadmapsPage from "@/pages/RoadmapsPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/assessment" component={AssessmentPage} />
      <Route path="/results" component={ResultsPage} />
      <Route path="/advisor" component={AdvisorPage} />
      <Route path="/roadmaps" component={RoadmapsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
