import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import LoginPage from "./pages/LoginPage";
import WeeklyPlanner from "./pages/WeeklyPlanner";
import Index from "./pages/Index";
import Children from "./pages/Children";
import Activities from "./pages/Activities";
import Projects from "./pages/Projects";
import Portfolio from "./pages/Portfolio";
import Reports from "./pages/Reports";
import Community from "./pages/Community";
import CalendarPage from "./pages/CalendarPage";
import SettingsPage from "./pages/SettingsPage";
import CreativeEngine from "./pages/CreativeEngine";
import FinancialLiteracy from "./pages/FinancialLiteracy";
import DigitalLiteracy from "./pages/DigitalLiteracy";
import Forum from "./pages/Forum";
import LearningAreas from "./pages/LearningAreas";
import ParentTraining from "./pages/ParentTraining";
import WorldMissions from "./pages/WorldMissions";
import AcceptInvite from "./pages/AcceptInvite";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <AppLoader />;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { session, loading } = useAuth();
  if (loading) return <AppLoader />;

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/weekly-planner" element={<ProtectedRoute><WeeklyPlanner /></ProtectedRoute>} />
      <Route path="/children" element={<ProtectedRoute><Children /></ProtectedRoute>} />
      <Route path="/curriculum" element={<Navigate to="/learning-areas" replace />} />
      <Route path="/activities" element={<ProtectedRoute><Activities /></ProtectedRoute>} />
      <Route path="/creative-engine" element={<ProtectedRoute><CreativeEngine /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/financial-literacy" element={<ProtectedRoute><FinancialLiteracy /></ProtectedRoute>} />
      <Route path="/digital-literacy" element={<ProtectedRoute><DigitalLiteracy /></ProtectedRoute>} />
      <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
      <Route path="/learning-areas" element={<ProtectedRoute><LearningAreas /></ProtectedRoute>} />
      <Route path="/parent-training" element={<ProtectedRoute><ParentTraining /></ProtectedRoute>} />
      <Route path="/world-missions" element={<ProtectedRoute><WorldMissions /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
