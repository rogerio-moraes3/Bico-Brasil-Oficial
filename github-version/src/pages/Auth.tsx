import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { signupSchema } from '@/lib/validation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Mail, Navigation, Loader2, Eye, EyeOff, KeyRound, ArrowLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCPF, validateCPF } from '@/lib/validators';
import { safeGoBack } from '@/lib/utils';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const mode = searchParams.get('mode') || (location.pathname === '/cadastro' ? 'signup' : 'login');
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [cities, setCities] = useState<Array<{ id: string; name: string; state: string }>>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [detectedCity, setDetectedCity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cpf, setCpf] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Autofocus no primeiro campo
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mode === 'signup') {
        const firstInput = document.querySelector('input[name="name"]') as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }
      } else {
        const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
        if (emailInput) {
          emailInput.focus();
        }
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [mode]);

  // Carregar categorias e cidades apenas no modo signup
  useEffect(() => {
    if (mode === 'signup') {
      loadCategories();
      loadCities();
    }
    loadSelectedCity();
  }, [mode]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, state')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const loadSelectedCity = () => {
    const saved = localStorage.getItem('selectedCity');
    if (saved) {
      setSelectedCity(saved);
    }
  };

  const detectLocation = () => {
    setDetectingLocation(true);

    if (!navigator.geolocation) {
      toast({
        title: "Geolocalização não suportada",
        description: "Seu navegador não suporta detecção de localização",
        variant: "destructive"
      });
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Geocodificação reversa usando Nominatim (OpenStreetMap)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'BicoBrasil/1.0'
              }
            }
          );

          const data = await response.json();
          const cityName = data.address.city || data.address.town || data.address.village || data.address.municipality;

          if (cityName) {
            // Buscar cidade no banco
            const { data: matchedCities } = await supabase
              .from('cities')
              .select('*')
              .ilike('name', `%${cityName}%`);

            if (matchedCities && matchedCities.length > 0) {
              const city = matchedCities[0];
              setSelectedCity(city.id);
              setDetectedCity(`${city.name} - ${city.state}`);
              toast({
                title: "Localização detectada!",
                description: `${city.name} - ${city.state}`,
              });
            } else {
              toast({
                title: "Cidade não encontrada",
                description: `${cityName} não está cadastrada. Selecione manualmente a cidade mais próxima.`,
                variant: "destructive"
              });
            }
          }
        } catch (error) {
          console.error('Erro na geocodificação:', error);
          toast({
            title: "Erro ao detectar cidade",
            description: "Não foi possível identificar sua localização. Selecione manualmente.",
            variant: "destructive"
          });
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        let message = "Permita o acesso à sua localização nas configurações do navegador";

        if (error.code === error.PERMISSION_DENIED) {
          message = "Você negou o acesso à localização. Ative nas configurações do navegador.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Localização indisponível. Verifique se o GPS está ativado.";
        } else if (error.code === error.TIMEOUT) {
          message = "Tempo esgotado ao buscar localização. Tente novamente.";
        }

        toast({
          title: "Erro ao obter localização",
          description: message,
          variant: "destructive"
        });
        setDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await signIn(email, password);

      if (error) {
        let errorTitle = "Erro ao entrar";
        let errorDescription = error.message;

        if (error.message === "Invalid login credentials") {
          errorDescription = "E-mail ou senha incorretos";
        } else if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
          errorTitle = "E-mail não confirmado";
          errorDescription = "Por favor, verifique seu e-mail ou aguarde um momento";
        }

        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive"
        });
        setLoading(false);
      } else {
        // Sucesso! O listener onAuthStateChange atualizará o user
        // e o useEffect (linha 73-77) fará o redirecionamento automaticamente
        toast({
          title: "Bem-vindo de volta!",
          description: "Login realizado com sucesso"
        });
        // NÃO chamar setLoading(false) aqui - deixar o listener fazer
        // NÃO chamar navigate('/app') aqui - deixar o useEffect fazer
      }
    } catch (err) {
      toast({
        title: "Erro de conexão",
        description: "Verifique sua internet e tente novamente",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          flowType: 'pkce',
          redirectTo: 'https://www.bicobrasil.com.br/auth/callback',
          skipBrowserRedirect: false
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro ao entrar com Google",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth?mode=reset-password`
    });

    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha"
      });
      setShowResetPassword(false);
      setResetEmail('');
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sucesso!",
        description: "Sua senha foi alterada com sucesso"
      });
      navigate('/auth?mode=login');
    }
    setLoading(false);
  };

  const handleCpfChange = (value: string) => {
    setCpf(formatCPF(value));
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevenir duplo disparo
    if (loading) return;

    // Validar que é um form
    if (!(e.currentTarget instanceof HTMLFormElement)) {
      console.error('[Auth] Erro: evento não é de um form');
      return;
    }

    setLoading(true);

    try {
      // Verificar consentimento LGPD
      if (!lgpdConsent) {
        toast({
          title: "Consentimento Necessário",
          description: "Você precisa aceitar a Política de Privacidade e os Termos de Uso",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Verificar se as senhas coincidem
      if (signupPassword !== signupConfirmPassword) {
        toast({
          title: "Senhas não coincidem",
          description: "A senha e a confirmação devem ser iguais",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Validar senha mínima
      if (signupPassword.length < 6) {
        toast({
          title: "Senha muito curta",
          description: "A senha deve ter pelo menos 6 caracteres",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Obter dados do formulário
      const formData = new FormData(e.currentTarget);
      const name = (formData.get('name') as string || '').trim();
      const email = (formData.get('email') as string || '').trim();
      const phone = (formData.get('phone') as string || '').trim();

      // Sanitizar CPF e WhatsApp (apenas números)
      const cleanCpf = cpf.replace(/\D/g, '');
      const cleanPhone = phone.replace(/\D/g, '');

      // Validar campos obrigatórios
      if (!name || !email || !cleanCpf || !cleanPhone || !selectedCity) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Payload completo com dados sanitizados
      const signupData = {
        name,
        email,
        password: signupPassword,
        cpf: cleanCpf,
        phone: cleanPhone,
        city_id: selectedCity
      };

      const { error } = await signUp(email, signupPassword, signupData);

      if (error) {
        // Se erro 500, tentar login automático (usuário pode ter sido criado)
        if (error.message?.includes('500') || error.message?.includes('Database error')) {
          const { error: loginError } = await signIn(email, signupPassword);

          if (!loginError) {
            setLoading(false);
            toast({
              title: "Cadastro realizado!",
              description: "Bem-vindo ao Bico Brasil"
            });
            setTimeout(() => {
              navigate('/app');
            }, 1000);
            return;
          }
        }

        let errorMessage = error.message;
        if (error.message?.includes('User already registered') || error.message?.includes('already been registered')) {
          errorMessage = 'Este e-mail já está cadastrado. Tente fazer login.';
        } else if (error.message?.includes('Password')) {
          errorMessage = 'Senha inválida. Use no mínimo 6 caracteres.';
        } else if (error.message?.includes('Email')) {
          errorMessage = 'E-mail inválido.';
        }

        toast({
          title: "Erro ao cadastrar",
          description: errorMessage,
          variant: "destructive"
        });
        setLoading(false);
      } else {
        setLoading(false);

        toast({
          title: "Cadastro realizado!",
          description: "Bem-vindo ao Bico Brasil"
        });

        setTimeout(() => {
          navigate('/app');
        }, 1000);
      }
    } catch (err: any) {
      console.error('[Auth] Erro inesperado:', err);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar seu cadastro. Tente novamente.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4 pb-20 md:pb-12">
        <div className="container max-w-md mx-auto">
          {/* Botão Voltar */}
          <Button
            variant="ghost"
            onClick={() => safeGoBack(navigate)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          {showResetPassword ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
                <CardDescription>
                  Digite seu e-mail para receber o link de recuperação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">E-mail</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? 'Enviando...' : 'Enviar Link'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowResetPassword(false);
                        setResetEmail('');
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : mode === 'reset-password' ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Nova Senha</CardTitle>
                <CardDescription>
                  Digite sua nova senha
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {mode === 'login' ? 'Entrar' : 'Cadastrar'}
                </CardTitle>
                <CardDescription>
                  {mode === 'login'
                    ? 'Entre com suas credenciais'
                    : 'Crie sua conta no Bico Brasil'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mode === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Entrando...' : 'Entrar'}
                    </Button>

                    <Button
                      type="button"
                      variant="link"
                      className="text-white hover:text-gray-200 underline p-0"
                      onClick={() => setShowResetPassword(true)}
                    >
                      Esqueci minha senha
                    </Button>

                    <Link
                      to="/recover-cpf"
                      className="text-sm text-primary hover:underline flex items-center justify-center gap-1"
                    >
                      <KeyRound className="h-3 w-3" />
                      Recuperar acesso pelo CPF
                    </Link>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Ou</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Entrar com Google
                    </Button>

                    <p className="text-sm text-center text-muted-foreground">
                      Não tem conta?{' '}
                      <Button
                        variant="default"
                        size="sm"
                        className="ml-2 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => navigate('/auth?mode=signup')}
                      >
                        Cadastre-se
                      </Button>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-tight">Nome Completo</Label>
                      <Input id="name" name="name" className="h-9 text-sm" required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-tight">E-mail</Label>
                      <Input id="email" name="email" type="email" className="h-9 text-sm" required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="cpf" className="text-xs font-semibold uppercase tracking-tight">CPF</Label>
                      <Input
                        id="cpf"
                        name="cpf"
                        value={cpf}
                        onChange={(e) => handleCpfChange(e.target.value)}
                        placeholder="000.000.000-00"
                        className="h-9 text-sm font-mono"
                        maxLength={14}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-tight">WhatsApp</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="(18) 99999-9999"
                        className="h-9 text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="city" className="text-xs font-semibold uppercase tracking-tight">Cidade</Label>
                      <Select value={selectedCity} onValueChange={setSelectedCity} required>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Selecione sua cidade" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {cities
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((city) => (
                              <SelectItem key={city.id} value={city.id} className="text-sm">
                                {city.name} - {city.state}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-tight">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          className="h-9 text-sm"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-tight">Confirmar Senha</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          name="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          className="h-9 text-sm"
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="lgpd"
                        checked={lgpdConsent}
                        onCheckedChange={(checked) => setLgpdConsent(checked as boolean)}
                      />
                      <label
                        htmlFor="lgpd"
                        className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Aceito a{' '}
                        <Link to="/privacy" className="text-primary hover:underline">
                          Política de Privacidade
                        </Link>{' '}
                        e os{' '}
                        <Link to="/terms" className="text-primary hover:underline">
                          Termos de Uso
                        </Link>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={loading || !lgpdConsent}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cadastrando...
                        </>
                      ) : (
                        'Cadastrar'
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Ou</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Cadastrar com Google
                    </Button>

                    <p className="text-sm text-center text-muted-foreground">
                      Já tem conta?{' '}
                      <Button
                        variant="default"
                        size="sm"
                        className="ml-2 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => navigate('/auth?mode=login')}
                      >
                        Entrar
                      </Button>
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
