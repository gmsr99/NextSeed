import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NexSeedLogo from "@/components/NexSeedLogo";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ email: "", password: "", familyName: "" });
  const [consented, setConsented] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    setLoading(false);
    if (error) return setError(error);
    navigate("/");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consented) {
      setError("Deves aceitar a Política de Privacidade e os Termos e Condições para criar uma conta.");
      return;
    }
    setError(null);
    setLoading(true);
    const { error } = await signUp(
      registerForm.email,
      registerForm.password,
      registerForm.familyName,
      new Date().toISOString(),
    );
    setLoading(false);
    if (error) return setError(error);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <NexSeedLogo dark={false} />
          <p className="text-sm text-muted-foreground">A tua plataforma de homeschooling</p>
        </div>

        <Tabs defaultValue="login">
          <TabsList className="w-full">
            <TabsTrigger value="login" className="flex-1">Entrar</TabsTrigger>
            <TabsTrigger value="register" className="flex-1">Criar conta</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Bem-vinda de volta</CardTitle>
                <CardDescription>Entra na tua conta NexSeed</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "A entrar..." : "Entrar"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Criar conta</CardTitle>
                <CardDescription>Começa o teu percurso NexSeed</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-family">Nome da família</Label>
                    <Input
                      id="reg-family"
                      value={registerForm.familyName}
                      onChange={(e) => setRegisterForm({ ...registerForm, familyName: e.target.value })}
                      placeholder="Família Silva"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="mínimo 6 caracteres"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="consent"
                      checked={consented}
                      onCheckedChange={(v) => { setConsented(!!v); setError(null); }}
                      className="mt-0.5"
                    />
                    <Label htmlFor="consent" className="text-sm font-normal leading-snug cursor-pointer">
                      Li e aceito a{" "}
                      <Link to="/privacidade" className="text-primary underline" target="_blank">
                        Política de Privacidade
                      </Link>{" "}
                      e os{" "}
                      <Link to="/termos" className="text-primary underline" target="_blank">
                        Termos e Condições
                      </Link>
                    </Label>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading || !consented}>
                    {loading ? "A criar conta..." : "Criar conta"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
