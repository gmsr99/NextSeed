import React, { Suspense, Component } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Lazy imports — cada rota só carrega quando visitada ─────────────────────
const LoginPage         = React.lazy(() => import("./pages/LoginPage"));
const WeeklyPlanner     = React.lazy(() => import("./pages/WeeklyPlanner"));
const Index             = React.lazy(() => import("./pages/Index"));
const Children          = React.lazy(() => import("./pages/Children"));
const Activities        = React.lazy(() => import("./pages/Activities"));
const Projects          = React.lazy(() => import("./pages/Projects"));
const Portfolio         = React.lazy(() => import("./pages/Portfolio"));
const Reports           = React.lazy(() => import("./pages/Reports"));
const Community         = React.lazy(() => import("./pages/Community"));
const CalendarPage      = React.lazy(() => import("./pages/CalendarPage"));
const SettingsPage      = React.lazy(() => import("./pages/SettingsPage"));
const CreativeEngine    = React.lazy(() => import("./pages/CreativeEngine"));
const FinancialLiteracy = React.lazy(() => import("./pages/FinancialLiteracy"));
const DigitalLiteracy   = React.lazy(() => import("./pages/DigitalLiteracy"));
const Forum             = React.lazy(() => import("./pages/Forum"));
const LearningAreas     = React.lazy(() => import("./pages/LearningAreas"));
const ParentTraining    = React.lazy(() => import("./pages/ParentTraining"));
const WorldMissions     = React.lazy(() => import("./pages/WorldMissions"));
const Extracurricular   = React.lazy(() => import("./pages/Extracurricular"));
const AcceptInvite      = React.lazy(() => import("./pages/AcceptInvite"));
const Metodologias      = React.lazy(() => import("./pages/Metodologias"));
const NotFound          = React.lazy(() => import("./pages/NotFound"));

// ─── Error Boundary ───────────────────────────────────────────────────────────
// Apanha erros de runtime que não são tratados localmente e apresenta um ecrã
// de recuperação em vez de um blank screen.

interface EBState { hasError: boolean; message: string }

class ErrorBoundary extends Component<{ children: React.ReactNode }, EBState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Ponto central para integrar logging futuro (ex: Sentry)
    console.error("[NexSeed ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-background px-4">
          <div className="max-w-sm w-full text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-xl font-heading font-bold">Algo correu mal</h1>
            <p className="text-sm text-muted-foreground">
              {this.state.message || "Ocorreu um erro inesperado."}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => this.setState({ hasError: false, message: "" })}
              >
                Tentar novamente
              </Button>
              <Button onClick={() => window.location.href = "/"}>
                Ir para o início
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Loaders ─────────────────────────────────────────────────────────────────

const AppLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

// ─── Sem família ──────────────────────────────────────────────────────────────

function NoFamilyScreen() {
  const { signOut } = useAuth();
  return (
    <div className="flex h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="text-4xl">🌿</div>
        <h1 className="text-xl font-heading font-bold">Sem acesso à família</h1>
        <p className="text-muted-foreground text-sm">
          A tua conta já não está associada a nenhuma família. Se achas que é um engano, contacta o responsável da família.
        </p>
        <button
          onClick={signOut}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}

// ─── Rota protegida ───────────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, family, loading } = useAuth();
  if (loading) return <AppLoader />;
  if (!session) return <Navigate to="/login" replace />;
  if (!family) return <NoFamilyScreen />;
  return <>{children}</>;
}

// ─── Rotas ────────────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AppRoutes() {
  const { session, loading } = useAuth();
  if (loading) return <AppLoader />;

  return (
    <Suspense fallback={<AppLoader />}>
      <Routes>
        <Route path="/login"          element={session ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/accept-invite"  element={<AcceptInvite />} />
        <Route path="/"               element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/weekly-planner" element={<ProtectedRoute><WeeklyPlanner /></ProtectedRoute>} />
        <Route path="/children"       element={<ProtectedRoute><Children /></ProtectedRoute>} />
        <Route path="/curriculum"     element={<Navigate to="/learning-areas" replace />} />
        <Route path="/activities"     element={<ProtectedRoute><Activities /></ProtectedRoute>} />
        <Route path="/creative-engine"element={<ProtectedRoute><CreativeEngine /></ProtectedRoute>} />
        <Route path="/projects"       element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/financial-literacy" element={<ProtectedRoute><FinancialLiteracy /></ProtectedRoute>} />
        <Route path="/digital-literacy"   element={<ProtectedRoute><DigitalLiteracy /></ProtectedRoute>} />
        <Route path="/portfolio"      element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
        <Route path="/reports"        element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/community"      element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/calendar"       element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
        <Route path="/settings"       element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/metodologias"   element={<ProtectedRoute><Metodologias /></ProtectedRoute>} />
        <Route path="/forum"          element={<ProtectedRoute><Forum /></ProtectedRoute>} />
        <Route path="/learning-areas" element={<ProtectedRoute><LearningAreas /></ProtectedRoute>} />
        <Route path="/parent-training"element={<ProtectedRoute><ParentTraining /></ProtectedRoute>} />
        <Route path="/world-missions" element={<ProtectedRoute><WorldMissions /></ProtectedRoute>} />
        <Route path="/extracurricular"element={<ProtectedRoute><Extracurricular /></ProtectedRoute>} />
        <Route path="*"               element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

const App = () => (
  <ErrorBoundary>
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
  </ErrorBoundary>
);

export default App;
