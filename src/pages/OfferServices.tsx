import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ShareButtons } from '@/components/ShareButtons';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CitySelect from '@/components/CitySelect';
import { useToast } from '@/hooks/use-toast';
import { useCities } from '@/hooks/useCities';
import { Loader2, ArrowLeft } from 'lucide-react';
import { safeGoBack } from '@/lib/utils';

export default function OfferServices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    service_title: '',
    category: '',
    subcategory: '',
    description: '',
    price: '',
    location: '',
    city_id: '',
    neighborhood: '',
    address: '',
    phone: '',
    availability: 'todos_os_dias',
    available_today: false,
    customCategory: '',
    isCustomCategory: false
  });

  const { cities, loading: citiesLoading } = useCities();
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    // restore autosave if present
    const saved = localStorage.getItem('offer_services_autosave');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch { }
    }
    loadData();
  }, [user, navigate]);

  // Autosave form locally (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      localStorage.setItem('offer_services_autosave', JSON.stringify(formData));
    }, 800);
    return () => clearTimeout(id);
  }, [formData]);

  const loadData = async () => {
    const [categoriesRes, profileRes] = await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('users').select('phone, city_id, neighborhood').eq('auth_id', user!.id).single()
    ]);

    setCategories(categoriesRes.data || []);

    if (profileRes.data) {
      setFormData(prev => ({
        ...prev,
        phone: profileRes.data.phone || '',
        city_id: profileRes.data.city_id || '',
        neighborhood: profileRes.data.neighborhood || ''
      }));
    }
  };

  // Aplicar cidade do user.metadata se não veio no profileRes
  useEffect(() => {
    if (cities.length && user?.user_metadata?.city_id && !formData.city_id) {
      const hasCity = cities.find(c => String(c.id) === String(user.user_metadata.city_id));
      if (hasCity) setFormData(prev => ({ ...prev, city_id: user.user_metadata.city_id }));
    }
  }, [cities, user, formData.city_id]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const handleCategoryChange = async (categoryId: string) => {
    if (categoryId === 'outros') {
      setFormData({
        ...formData,
        category: categoryId,
        subcategory: '',
        isCustomCategory: true
      });
      setSubcategories([]);
    } else {
      setFormData({
        ...formData,
        category: categoryId,
        subcategory: '',
        isCustomCategory: false,
        customCategory: ''
      });

      const { data } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId);

      setSubcategories(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      if (!formData.service_title.trim()) {
        throw new Error('Título do serviço é obrigatório');
      }
      if (!formData.category) {
        throw new Error('Categoria é obrigatória');
      }
      if (!formData.description.trim()) {
        throw new Error('Descrição é obrigatória');
      }
      if (!formData.city_id) {
        throw new Error('Cidade é obrigatória');
      }
      if (!formData.phone.trim()) {
        throw new Error('Telefone é obrigatório');
      }

      // Offline handling
      if (!navigator.onLine) {
        // Save to offline queue (include auth id for later processing)
        const { enqueue } = await import('@/lib/offlineQueue');
        enqueue({ type: 'offerService', payload: { ...formData, _auth_id: user!.id } } as any);
        localStorage.removeItem('offer_services_autosave');
        toast({ title: 'Sem internet', description: 'Vamos publicar assim que a conexão voltar' });
        navigate('/profile');
        return;
      }

      // 1. Atualizar perfil do usuário
      const { error: userError } = await supabase
        .from('users')
        .update({
          type: 'worker',
          phone: formData.phone,
          city_id: formData.city_id,
          neighborhood: formData.neighborhood,
          updated_at: new Date().toISOString()
        })
        .eq('auth_id', user!.id);

      if (userError) throw userError;

      // 2. Buscar user_id do usuário autenticado
      const { data: userData, error: getUserError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user!.id)
        .single();

      if (getUserError || !userData) {
        throw new Error('Usuário não encontrado');
      }

      // 3. Criar registro na tabela worker_services
      let serviceResult: any = null;
      try {
        // Check if availability exists in schema
        const { hasColumn } = await import('@/lib/schemaCheck');
        const availabilityExists = await hasColumn('worker_services', 'availability');

        const payload: any = {
          user_id: userData.id,
          title: formData.service_title,
          description: formData.description,
          category_id: formData.isCustomCategory ? null : formData.category,
          custom_category: formData.isCustomCategory ? formData.customCategory.trim() : null,
          subcategory_id: formData.subcategory || null,
          price: formData.price ? parseFloat(formData.price) : null,
          location: formData.location || null,
          active: true
        };

        if (availabilityExists) payload.availability = formData.availability;

        const { data: sdata, error: serror } = await supabase.from('worker_services').insert(payload).select();
        if (serror) throw serror;
        serviceResult = sdata;
      } catch (serviceErr: any) {
        if (serviceErr?.message?.toLowerCase?.().includes('availability')) {
          try {
            const payloadFallback: any = {
              user_id: userData.id,
              title: formData.service_title,
              description: formData.description,
              category_id: formData.isCustomCategory ? null : formData.category,
              custom_category: formData.isCustomCategory ? formData.customCategory.trim() : null,
              subcategory_id: formData.subcategory || null,
              price: formData.price ? parseFloat(formData.price) : null,
              location: formData.location || null,
              active: true
            };
            const { data: sdata2, error: serror2 } = await supabase.from('worker_services').insert(payloadFallback).select();
            if (serror2) throw serror2;
            serviceResult = sdata2;
          } catch (e: any) {
            throw e;
          }
        } else {
          throw serviceErr;
        }
      }

      // Clear autosave
      localStorage.removeItem('offer_services_autosave');

      toast({
        title: "Serviço cadastrado!",
        description: "Seu serviço está visível para clientes.",
      });

      navigate('/profile');

    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar serviço",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8 max-w-3xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => safeGoBack(navigate, '/profile')}
          className="mb-4 text-[var(--nav-link)]"
        >
          <ArrowLeft className="h-4 w-4 mr-2 text-[var(--nav-link)]" />
          Voltar
        </Button>
        <Card className="max-h-[80vh] overflow-y-auto container-outline">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Oferecer Meus Serviços</CardTitle>
                <p className="text-muted-foreground">
                  Cadastre seu serviço e seja encontrado por clientes
                </p>
              </div>
              <ShareButtons
                text="Quer fazer bicos e ganhar dinheiro extra? Cadastre-se no Bico Brasil!"
                url="https://bicobrasil.com.br/offer-services"
              />
            </div>
          </CardHeader>
          <CardContent>
            {!isOnline && (
              <div className="mb-4 rounded-md bg-yellow-50 border border-yellow-200 p-3 text-yellow-800">
                <strong>Sem internet no momento</strong> — seus dados serão salvos localmente e publicados assim que a conexão voltar.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Título do Serviço */}
              <div>
                <Label htmlFor="service_title">Título do Serviço *</Label>
                <Input
                  id="service_title"
                  placeholder="Ex: Sou pedreiro — Faço reboco, contrapiso, reformas"
                  value={formData.service_title}
                  onChange={(e) => setFormData({ ...formData, service_title: e.target.value })}
                  required
                />
              </div>

              {/* Categoria */}
              <div>
                <Label>Categoria *</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.sort((a, b) => a.name.localeCompare(b.name)).map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campo personalizado "Outros" */}
              {formData.category === 'outros' && (
                <div>
                  <Label htmlFor="customCategory">Descreva sua especialidade *</Label>
                  <Input
                    id="customCategory"
                    placeholder="Ex: Instalação de antenas, montagem de móveis planejados..."
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    required
                    maxLength={100}
                  />
                </div>
              )}

              {/* Subcategoria */}
              {formData.category && !formData.isCustomCategory && subcategories.length > 0 && (
                <div>
                  <Label>Subcategoria</Label>
                  <Select value={formData.subcategory} onValueChange={(val) => setFormData({ ...formData, subcategory: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a subcategoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map(sub => (
                        <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Descrição */}
              <div>
                <Label htmlFor="description">Descrição Detalhada *</Label>
                <Textarea
                  id="description"
                  placeholder="Ex: Sou pedreiro com 8 anos de experiência. Faço reboco, contrapiso, colocação de pisos, reformas e manutenções gerais. Orçamentos sem compromisso."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              {/* Preço */}
              <div>
                <Label htmlFor="price">Preço Médio (opcional)</Label>
                <Input
                  id="price"
                  placeholder="Ex: R$ 150 por diária / R$ 40 m²"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              {/* Cidade */}
              <div>
                <Label>Cidade *</Label>
                <CitySelect
                  value={formData.city_id}
                  onChange={(val) => setFormData({ ...formData, city_id: val })}
                  cities={cities}
                  includeAll={false}
                  placeholder="Selecione a cidade"
                />
              </div>

              {/* Bairro - Opcional */}
              <div>
                <Label htmlFor="neighborhood">Bairro (opcional)</Label>
                <Input
                  id="neighborhood"
                  placeholder="Digite o bairro"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                />
              </div>

              {/* Endereço */}
              <div>
                <Label htmlFor="address">Endereço (opcional)</Label>
                <Input
                  id="address"
                  placeholder="Rua, número, complemento"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              {/* Telefone */}
              <div>
                <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(18) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              {/* Disponível Hoje Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="available_today"
                  checked={formData.available_today}
                  onCheckedChange={(checked) => setFormData({ ...formData, available_today: checked })}
                />
                <Label htmlFor="available_today" className="cursor-pointer">Disponível hoje</Label>
              </div>

              {/* Disponibilidade */}
              <div>
                <Label>Disponibilidade *</Label>
                <Select value={formData.availability} onValueChange={(val) => setFormData({ ...formData, availability: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos_os_dias">Todos os dias</SelectItem>
                    <SelectItem value="seg_sex">Segunda a Sexta</SelectItem>
                    <SelectItem value="finais_semana">Finais de semana</SelectItem>
                    <SelectItem value="agendamento">Somente por agendamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  "Publicar Meu Serviço"
                )}
              </Button>

              {!isOnline && localStorage.getItem('offer_services_autosave') && (
                <p className="text-sm text-muted-foreground mt-2">Salvo localmente — vamos publicar assim que a conexão voltar.</p>
              )}

            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
