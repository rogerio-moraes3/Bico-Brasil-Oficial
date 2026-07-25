import { useState, useEffect } from 'react';
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
import { validateCPF, formatCPF } from '@/lib/validators';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { safeGoBack } from '@/lib/utils';

export default function CompleteProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
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
    neighborhood: '',
    city_id: '',
    category: '',
  });
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadData();
  }, [user]);

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
      if (!formData.phone.trim()) {
        toast({
          title: 'Campo obrigatório',
          description: 'Telefone/WhatsApp é obrigatório',
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

      // Atualizar perfil
      const { error } = await supabase
        .from('users')
        .update({
          cpf: cpfClean,
          phone: formData.phone.trim(),
          phone_type: formData.phone_type,
          cep: formData.cep.replace(/\D/g, '') || null,
          address: formData.address.trim() || null,
          neighborhood: formData.neighborhood.trim(),
          city_id: formData.city_id,
          ...(profile?.type === 'worker' && { category: formData.category }),
          updated_at: new Date().toISOString(),
        })
        .eq('auth_id', user!.id);

      if (error) throw error;

      toast({
        title: 'Perfil completado!',
        description: 'Seu cadastro foi atualizado com sucesso',
      });

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
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  IMPORTANTE: Este número será usado para contato direto. Certifique-se de que está correto e funcionando!
                </p>
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
                <Label htmlFor="cep">CEP</Label>
                <div className="relative">
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    maxLength={9}
                  />
                  {cepLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Opcional — preenche rua, bairro e cidade automaticamente. Você pode editar tudo depois.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Rua / Endereço</Label>
                <Input
                  id="address"
                  placeholder="Ex: Rua das Flores, 123"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
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
