import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CitySelect from '@/components/CitySelect';
import { useToast } from '@/hooks/use-toast';
import { useCities } from '@/hooks/useCities';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { validateCPF, formatCPF, validatePhone, formatPhone } from '@/lib/validators';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Loader2, CheckCircle2, MessageCircle, LifeBuoy } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { safeGoBack } from '@/lib/utils';

const RESEND_COOLDOWN_SECONDS = 45;
const CODE_EXPIRY_SECONDS = 10 * 60;

export default function CompleteProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { refresh: refreshProfileCompletion } = useProfileCompletion();
  const missingFields = location.state?.missingFields || [];

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { cities, loading: citiesLoading } = useCities();
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    cpf: '',
    phone: '',
    phone_type: 'whatsapp_only',
    cep: '',
    address: '',
    house_number: '',
    neighborhood: '',
    city_id: '',
    category: '',
  });
  const [cepLoading, setCepLoading] = useState(false);

  // Verificação de telefone por código (Twilio Verify via send-phone-code /
  // verify-phone-code). phoneVerifiedNumber guarda qual número foi
  // verificado NESTA sessão — se o usuário trocar o telefone depois de
  // verificar, precisa verificar de novo (comparado abaixo).
  const [phoneVerifiedNumber, setPhoneVerifiedNumber] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpBlocked, setOtpBlocked] = useState(false);
  const [otpAttemptsRemaining, setOtpAttemptsRemaining] = useState<number | null>(null);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const [expirySecondsLeft, setExpirySecondsLeft] = useState(0);
  const cooldownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadData();
  }, [user]);

  useEffect(() => {
    return () => {
      if (cooldownInterval.current) clearInterval(cooldownInterval.current);
    };
  }, []);

  const loadData = async () => {
    const [profileRes, categoriesRes] = await Promise.all([
      supabase.from('users').select('*').eq('auth_id', user!.id).maybeSingle(),
      supabase.from('categories').select('*').order('name'),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
      setFormData({
        cpf: profileRes.data.cpf || '',
        phone: profileRes.data.phone || '',
        phone_type: (profileRes.data as any).phone_type || 'whatsapp_only',
        cep: (profileRes.data as any).cep || '',
        address: profileRes.data.address || '',
        house_number: (profileRes.data as any).house_number || '',
        neighborhood: profileRes.data.neighborhood || '',
        city_id: profileRes.data.city_id || '',
        category: profileRes.data.category || '',
      });
    }

    setCategories(categoriesRes.data || []);
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 8);
    return numbers.replace(/(\d{5})(\d)/, '$1-$2');
  };

  const lookupCep = async (cepDigits: string) => {
    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast({
          title: 'CEP não encontrado',
          description: 'Verifique o CEP ou preencha o endereço manualmente',
          variant: 'destructive',
        });
        return;
      }

      const matchedCity = cities.find(
        (c) => c.name.toLowerCase() === (data.localidade || '').toLowerCase() && c.state === data.uf
      );

      setFormData((prev) => ({
        ...prev,
        address: data.logradouro || prev.address,
        neighborhood: data.bairro || prev.neighborhood,
        city_id: matchedCity ? matchedCity.id : prev.city_id,
      }));

      if (matchedCity) {
        toast({
          title: 'Endereço encontrado!',
          description: `${data.logradouro || ''}, ${data.bairro || ''} - ${data.localidade}/${data.uf}`,
        });
      } else {
        toast({
          title: 'Cidade não atendida',
          description: `${data.localidade} - ${data.uf} não está na nossa lista. Selecione a cidade manualmente.`,
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Erro ao buscar CEP',
        description: 'Não foi possível consultar o CEP agora. Preencha o endereço manualmente.',
        variant: 'destructive',
      });
    } finally {
      setCepLoading(false);
    }
  };

  const handleCepChange = (value: string) => {
    const formatted = formatCEP(value);
    setFormData((prev) => ({ ...prev, cep: formatted }));
    if (formatted.replace(/\D/g, '').length === 8) {
      lookupCep(formatted.replace(/\D/g, ''));
    }
  };

  const phoneClean = formData.phone.replace(/\D/g, '');
  const alreadyVerifiedForThisNumber = !!profile?.phone_verified && profile?.phone === phoneClean;
  const phoneIsVerified = phoneVerifiedNumber === phoneClean || alreadyVerifiedForThisNumber;

  // Trocar o número invalida a verificação anterior — reseta o estado do
  // fluxo de código pra não deixar a tela num estado inconsistente (ex:
  // "código enviado" pro número antigo, mas o campo já mudou).
  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: formatPhone(value) });
    setOtpSent(false);
    setOtpCode('');
    setOtpBlocked(false);
    setOtpAttemptsRemaining(null);
  };

  const startResendCooldown = () => {
    if (cooldownInterval.current) clearInterval(cooldownInterval.current);
    setResendSecondsLeft(RESEND_COOLDOWN_SECONDS);
    setExpirySecondsLeft(CODE_EXPIRY_SECONDS);
    cooldownInterval.current = setInterval(() => {
      setResendSecondsLeft((s) => (s > 0 ? s - 1 : 0));
      setExpirySecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
  };

  // send-phone-code/verify-phone-code sempre respondem com JSON estruturado
  // mesmo em 4xx/423 (reason, attemptsRemaining) — usa fetch direto em vez de
  // supabase.functions.invoke() pra não depender de como cada versão do SDK
  // expõe o corpo de um erro HTTP.
  const callPhoneFunction = async (name: 'send-phone-code' | 'verify-phone-code', body: Record<string, unknown>) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, ...json } as {
      status: number;
      success: boolean;
      error?: string;
      reason?: string;
      attemptsRemaining?: number;
      channel?: 'whatsapp' | 'sms';
    };
  };

  const handleSendCode = async () => {
    if (!validatePhone(phoneClean)) {
      toast({
        title: 'Telefone inválido',
        description: 'Digite um número com DDD, só números (ex: 14999999999)',
        variant: 'destructive',
      });
      return;
    }

    setOtpSending(true);
    try {
      const result = await callPhoneFunction('send-phone-code', { phone: phoneClean });
      if (!result.success) {
        toast({ title: 'Não foi possível enviar o código', description: result.error, variant: 'destructive' });
        return;
      }
      setOtpSent(true);
      setOtpBlocked(false);
      setOtpAttemptsRemaining(null);
      setOtpCode('');
      startResendCooldown();
      toast({
        title: result.channel === 'whatsapp' ? 'Código enviado por WhatsApp!' : 'Código enviado por SMS!',
        description: 'Digite os 6 dígitos que você recebeu.',
      });
    } catch {
      toast({ title: 'Erro ao enviar código', description: 'Tente novamente em instantes.', variant: 'destructive' });
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (otpCode.length !== 6) return;

    setOtpVerifying(true);
    try {
      const result = await callPhoneFunction('verify-phone-code', { phone: phoneClean, code: otpCode });
      if (result.success) {
        setPhoneVerifiedNumber(phoneClean);
        setOtpSent(false);
        setOtpCode('');
        toast({ title: 'Telefone verificado!', description: 'Agora é só completar o resto do cadastro.' });
        return;
      }

      if (result.reason === 'too_many_attempts') {
        setOtpBlocked(true);
      } else {
        setOtpAttemptsRemaining(result.attemptsRemaining ?? null);
        setOtpCode('');
        toast({ title: 'Código incorreto', description: result.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erro ao verificar código', description: 'Tente novamente em instantes.', variant: 'destructive' });
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validação CPF
      if (!formData.cpf.trim()) {
        toast({
          title: 'Campo obrigatório',
          description: 'CPF é obrigatório',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const cpfClean = formData.cpf.replace(/\D/g, '');
      if (!validateCPF(cpfClean)) {
        toast({
          title: 'CPF inválido',
          description: 'Digite um CPF válido',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Verificar CPF duplicado
      const { data: existingCpf } = await supabase
        .from('users')
        .select('id')
        .eq('cpf', cpfClean)
        .neq('auth_id', user!.id)
        .maybeSingle();

      if (existingCpf) {
        toast({
          title: 'CPF já cadastrado',
          description: 'Este CPF já está em uso por outro usuário',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Validação telefone
      if (!phoneClean) {
        toast({
          title: 'Campo obrigatório',
          description: 'Telefone/WhatsApp é obrigatório',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (!validatePhone(phoneClean)) {
        toast({
          title: 'Telefone inválido',
          description: 'Digite um número com DDD, só números (ex: 14999999999)',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (!phoneIsVerified) {
        toast({
          title: 'Confirme seu telefone',
          description: 'Envie e digite o código de verificação antes de continuar — é por esse número que os contratantes vão falar com você.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (!formData.cep.trim() || formData.cep.replace(/\D/g, '').length !== 8) {
        toast({
          title: 'Campo obrigatório',
          description: 'CEP é obrigatório',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (!formData.house_number.trim()) {
        toast({
          title: 'Campo obrigatório',
          description: 'Número da residência é obrigatório',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (!formData.neighborhood.trim()) {
        toast({
          title: 'Campo obrigatório',
          description: 'Bairro é obrigatório',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (!formData.city_id) {
        toast({
          title: 'Campo obrigatório',
          description: 'Cidade é obrigatória',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (profile?.type === 'worker' && !formData.category) {
        toast({
          title: 'Campo obrigatório',
          description: 'Categoria de trabalho é obrigatória',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Criar ou atualizar perfil (upsert: usuários órfãos, sem linha em public.users,
      // precisam do INSERT aqui; um .update() simples falha silenciosamente para eles).
      // phone_verified/phone_verified_at não entram aqui — verify-phone-code já
      // grava isso direto em public.users no momento da confirmação do código.
      const { error } = await supabase
        .from('users')
        .upsert(
          {
            id: user!.id,
            auth_id: user!.id,
            name: profile?.name || user!.user_metadata?.name || user!.user_metadata?.full_name || user!.email || '',
            email: profile?.email || user!.email || '',
            cpf: cpfClean,
            phone: phoneClean,
            phone_type: formData.phone_type,
            cep: formData.cep.replace(/\D/g, ''),
            address: formData.address.trim() || null,
            house_number: formData.house_number.trim(),
            neighborhood: formData.neighborhood.trim(),
            city_id: formData.city_id,
            ...(profile?.type === 'worker' && { category: formData.category }),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'auth_id' }
        );

      if (error) throw error;

      toast({
        title: 'Perfil completado!',
        description: 'Seu cadastro foi atualizado com sucesso',
      });

      await refreshProfileCompletion();
      navigate('/app');
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="container mx-auto px-4 py-8 min-h-screen overflow-y-auto pb-20 md:pb-8">
        <Button
          variant="ghost"
          onClick={() => safeGoBack(navigate, '/app')}
          className="mb-4 text-[var(--nav-link)]"
        >
          <ArrowLeft className="h-4 w-4 mr-2 text-[var(--nav-link)]" />
          Voltar
        </Button>
        <Card className="max-w-2xl mx-auto max-h-[85vh] overflow-y-auto container-outline">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <AlertCircle className="h-6 w-6 text-primary" />
              Complete seu cadastro para começar!
            </CardTitle>
            <CardDescription className="text-center text-base mt-4">
              <strong>Este é seu contato principal!</strong> Ele precisa estar funcionando para que os contratantes entrem em contato com você.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {missingFields.length > 0 && (
              <Alert className="mb-6">
                <AlertDescription>
                  Faltam os seguintes campos: <strong>{missingFields.join(', ')}</strong>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                  maxLength={14}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Seu CPF é necessário para validação e segurança da plataforma
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(14) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  maxLength={15}
                  disabled={otpSent}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  IMPORTANTE: Este número será usado para contato direto. Certifique-se de que está correto e funcionando!
                </p>

                {/* Bloco de verificação por código — some quando o número já está confirmado */}
                {phoneIsVerified ? (
                  <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 mt-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Telefone confirmado
                  </div>
                ) : otpBlocked ? (
                  <Alert variant="destructive" className="mt-2">
                    <LifeBuoy className="h-4 w-4" />
                    <AlertDescription>
                      Não conseguimos confirmar esse número depois de várias tentativas.{' '}
                      <a href="mailto:contato.bicobrasil@gmail.com" className="underline font-medium">
                        Fale com o suporte
                      </a>{' '}
                      pra gente te ajudar a verificar.
                    </AlertDescription>
                  </Alert>
                ) : !otpSent ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={handleSendCode}
                    disabled={otpSending || !validatePhone(phoneClean)}
                  >
                    {otpSending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MessageCircle className="h-4 w-4 mr-2" />
                    )}
                    Enviar código de verificação
                  </Button>
                ) : (
                  <div className="mt-3 space-y-3 rounded-lg border p-4 bg-muted/30">
                    <p className="text-sm font-medium">Digite o código que você recebeu:</p>
                    <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                    {otpAttemptsRemaining !== null && (
                      <p className="text-xs text-destructive">
                        Código incorreto. {otpAttemptsRemaining} {otpAttemptsRemaining === 1 ? 'tentativa restante' : 'tentativas restantes'}.
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleVerifyCode}
                        disabled={otpVerifying || otpCode.length !== 6}
                      >
                        {otpVerifying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Verificar código
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleSendCode}
                        disabled={otpSending || resendSecondsLeft > 0}
                      >
                        {resendSecondsLeft > 0 ? `Reenviar em ${resendSecondsLeft}s` : 'Reenviar código'}
                      </Button>
                    </div>
                    {expirySecondsLeft > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Código expira em {Math.floor(expirySecondsLeft / 60)}:{String(expirySecondsLeft % 60).padStart(2, '0')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_type">Como você prefere ser contatado? *</Label>
                <Select
                  value={formData.phone_type}
                  onValueChange={(value) => setFormData({ ...formData, phone_type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha o tipo de contato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp_only">Somente WhatsApp</SelectItem>
                    <SelectItem value="whatsapp_and_call">WhatsApp e Ligação</SelectItem>
                    <SelectItem value="call_only">Somente Ligação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP *</Label>
                <div className="relative">
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    maxLength={9}
                    required
                  />
                  {cepLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Preenche rua, bairro e cidade automaticamente — confira e edite se precisar.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address">Rua / Endereço</Label>
                  <Input
                    id="address"
                    placeholder="Ex: Rua das Flores"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="house_number">Número *</Label>
                  <Input
                    id="house_number"
                    placeholder="123"
                    value={formData.house_number}
                    onChange={(e) => setFormData({ ...formData, house_number: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <CitySelect
                  value={formData.city_id}
                  onChange={(value) => setFormData({ ...formData, city_id: value })}
                  cities={cities}
                  includeAll={false}
                  placeholder="Selecione sua cidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro *</Label>
                <Input
                  id="neighborhood"
                  placeholder="Ex: Centro, Vila Nova, etc."
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  required
                />
              </div>

              {profile?.type === 'worker' && (
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria de Trabalho *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Salvando...' : 'Completar Cadastro'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
