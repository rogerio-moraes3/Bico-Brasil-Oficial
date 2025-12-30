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

  // Autofocus no primeiro campo
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mode === 'signup') {
        const firstInput = document.querySelector('input[name="name"]') as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
          console.log('✅ Foco automático no campo nome');
        }
      } else {
        const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
        if (emailInput) {
          emailInput.focus();
          console.log('✅ Foco automático no campo email');
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
        toast({
          title: "Erro ao entrar",
          description: error.message === "Invalid login credentials"
            ? "E-mail ou senha incorretos"
            : error.message,
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
    setLoading(true);

    // Verificar consentimento LGPD
    if (!lgpdConsent) {
      toast({
        title: "Consentimento Necessário",
        description: "Você precisa aceitar a Política de Privacidade e os Termos de Uso para continuar",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // Validar CPF
    const cleanCpf = cpf.replace(/\D/g, '');
    if (!validateCPF(cleanCpf)) {
      toast({
        title: "CPF inválido",
        description: "Digite um CPF válido",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // Verificar se CPF já existe
    const { data: existingCpf } = await supabase
      .from('users')
      .select('id')
      .eq('cpf', cleanCpf)
      .maybeSingle();

    if (existingCpf) {
      toast({
        title: "CPF já cadastrado",
        description: "Este CPF já está cadastrado na plataforma. Tente recuperar sua conta.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const categorySlug = formData.get('category') as string;
    const selectedCat = categories.find(c => c.slug === categorySlug);
    const neighborhood = (formData.get('neighborhood') as string || '').trim();

    // Formatar bairro se preenchido (agora é opcional)
    const formattedNeighborhood = neighborhood
      ? neighborhood
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      : '';

    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      phone: formData.get('phone') as string,
      neighborhood: formattedNeighborhood,
      type: formData.get('type') as string,
      user_role: formData.get('user_role') as string || 'prestador',
      category: selectedCat?.name || undefined,
      subcategory: formData.get('subcategory') as string || undefined,
      description: formData.get('description') as string || undefined,
      price: formData.get('price') as string || undefined,
      city_id: selectedCity || undefined,
      primary_contact_method: formData.get('primary_contact_method') as string || 'whatsapp',
      cpf: cleanCpf
    };

    const validation = signupSchema.safeParse(data);

    if (!validation.success) {
      toast({
        title: "Erro de validação",
        description: validation.error.errors[0].message,
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    console.log('[Auth] Iniciando cadastro para:', data.email);
    const { error } = await signUp(data.email, data.password, data);

    if (error) {
      console.error('[Auth] Erro no cadastro:', error);

      // Mensagens específicas para erros comuns
      let errorMessage = error.message;
      if (error.message?.includes('User already registered') || error.message?.includes('already been registered')) {
        errorMessage = 'Este e-mail já está cadastrado. Tente fazer login ou recuperar sua senha.';
      } else if (error.message?.includes('Password')) {
        errorMessage = 'Senha inválida. Use no mínimo 6 caracteres.';
      } else if (error.message?.includes('Email')) {
        errorMessage = 'E-mail inválido. Verifique e tente novamente.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      }

      toast({
        title: "Erro ao cadastrar",
        description: errorMessage,
        variant: "destructive"
      });
    } else {
      console.log('[Auth] Cadastro realizado com sucesso');
      toast({
        title: "Cadastro realizado!",
        description: "Bem-vindo ao Bico Brasil"
      });
      navigate('/app');
    }

    setLoading(false);
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
                      <Label htmlFor="cpf" className="text-xs font-semibold uppercase tracking-tight">CPF (Obrigatório)</Label>
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
                      <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-tight">E-mail</Label>
                      <Input id="email" name="email" type="email" className="h-9 text-sm" required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-tight">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          className="h-9 text-sm"
                          required
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
                      <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-tight">WhatsApp</Label>
                      <Input id="phone" name="phone" placeholder="(18) 99999-9999" className="h-9 text-sm" required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="city" className="text-xs font-semibold uppercase tracking-tight">Cidade</Label>
                      <div className="flex gap-2">
                        <Select value={selectedCity} onValueChange={setSelectedCity} required>
                          <SelectTrigger className="flex-1 h-9 text-sm">
                            <SelectValue placeholder="Selecione" />
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

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 shrink-0"
                          onClick={detectLocation}
                          disabled={detectingLocation}
                        >
                          {detectingLocation ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Navigation className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {detectedCity && (
                        <p className="text-sm text-muted-foreground">
                          Localização detectada: {detectedCity}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="neighborhood" className="text-xs font-semibold uppercase tracking-tight">Bairro</Label>
                      <Input id="neighborhood" name="neighborhood" className="h-9 text-sm" required />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="type" className="text-xs font-semibold uppercase tracking-tight">Tipo de Usuário</Label>
                      <Select name="type" required>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contractor">Contratante</SelectItem>
                          <SelectItem value="worker">Prestador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="user_role" className="text-xs font-semibold uppercase tracking-tight">Oferece Vagas?</Label>
                      <Select name="user_role" defaultValue="prestador">
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prestador">Não, procuro serviços</SelectItem>
                          <SelectItem value="empregador">Sim, ofereço vagas</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Empregadores ganham 10 publicações grátis!
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="category" className="text-xs font-semibold uppercase tracking-tight">Categoria Principal</Label>
                      <Select name="category">
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea id="description" name="description" rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço Sugerido</Label>
                      <Input id="price" name="price" placeholder="R$ 150/dia" />
                    </div>

                    <div className="space-y-2">
                      <Label>Melhor forma de contato *</Label>
                      <Select name="primary_contact_method" defaultValue="whatsapp" required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ligacao">Ligação</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="ambos">Ambos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3 p-4 bg-muted rounded-lg">
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id="lgpd-consent"
                          checked={lgpdConsent}
                          onChange={(e) => setLgpdConsent(e.target.checked)}
                          className="mt-1"
                        />
                        <Label htmlFor="lgpd-consent" className="text-sm leading-relaxed cursor-pointer">
                          <strong>Consentimento LGPD:</strong> Autorizo o Bico Brasil a coletar, armazenar e tratar meus dados pessoais (nome, telefone, e-mail, CPF, documentos, imagens) para fins de autenticação, publicação de serviços, comunicação entre contratante e prestador, processamento de pagamentos e cumprimento de obrigações legais, conforme a Lei nº 13.709/2018 (LGPD).{' '}
                          <a href="/privacy" target="_blank" className="text-primary underline">
                            Li e aceito a Política de Privacidade
                          </a>{' '}
                          e{' '}
                          <a href="/terms" target="_blank" className="text-primary underline">
                            os Termos de Uso
                          </a>.
                        </Label>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || !lgpdConsent}>
                      {loading ? 'Cadastrando...' : 'Cadastrar'}
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
