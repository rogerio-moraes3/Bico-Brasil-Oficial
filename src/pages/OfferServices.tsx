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
import { Switch } from '@/components/ui/switch';

export default function OfferServices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    service_title: '',
    profession_raw: '',
    description: '',
    price: '',
    city_id: '',
    neighborhood: '',
    address: '',
    phone: '',
    availability: 'todos_os_dias',
    available_today: false,
    occupation_id: null as number | null,
    confidence_score: null as number | null,
    occupation_category: ''
  });

  const { cities, loading: citiesLoading } = useCities();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

    const cats = categoriesRes.data || [];
    setCategories(cats);

    // Cache categories in localStorage
    if (cats.length > 0) {
      localStorage.setItem('offer_services_categories_cache', JSON.stringify(cats));
    }

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

  // Autocomplete for profession
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!formData.profession_raw.trim() || formData.profession_raw.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('search_ocupacoes', {
          q: formData.profession_raw,
          lim: 8,
          min_sim: 0.3
        });

        if (!error && data) {
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch (err) {
        // Silently fail if RPC doesn't exist
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [formData.profession_raw]);

  const handleSuggestionClick = (suggestion: any) => {
    setFormData({
      ...formData,
      profession_raw: suggestion.nome_oficial,
      occupation_id: suggestion.ocupacao_id,
      confidence_score: suggestion.similarity_score,
      occupation_category: suggestion.categoria_principal || ''
    });
    setShowSuggestions(false);
  };

  const normalizeCategoryName = (name: string): string => {
    return name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  const CATEGORY_NAME_TO_SLUG: { [key: string]: string } = {
    'construcao e reforma': 'construcao-reforma',
    'construção e reforma': 'construcao-reforma',
    'limpeza': 'limpeza',
    'montagem e reparos': 'montagem-reparos',
    'montagem & reparos': 'montagem-reparos',
    'jardinagem e externos': 'jardinagem-externos',
    'jardinagem & externos': 'jardinagem-externos',
    'transporte e ajuda': 'transporte-ajuda',
    'transporte & ajuda': 'transporte-ajuda'
  };

  const fallbackCategoryId = (): string | null => {
    // Try from state
    let cat = categories.find(c => c.slug === 'outros' || c.slug === 'outros-servicos');
    if (cat) return cat.id;

    // Try from cache
    try {
      const cached = localStorage.getItem('offer_services_categories_cache');
      if (cached) {
        const cachedCats = JSON.parse(cached);
        cat = cachedCats.find((c: any) => c.slug === 'outros' || c.slug === 'outros-servicos');
        if (cat) return cat.id;
      }
    } catch { }

    return null;
  };

  const inferCategoryId = (): string | null => {
    // Only infer if confidence >= 0.3 and occupation_category exists
    if (!formData.occupation_category || (formData.confidence_score !== null && formData.confidence_score < 0.3)) {
      return fallbackCategoryId();
    }

    const normalized = normalizeCategoryName(formData.occupation_category);
    const slug = CATEGORY_NAME_TO_SLUG[normalized];

    if (!slug) {
      return fallbackCategoryId();
    }

    // Find in state
    let cat = categories.find(c => c.slug === slug);
    if (cat) return cat.id;

    // Find in cache
    try {
      const cached = localStorage.getItem('offer_services_categories_cache');
      if (cached) {
        const cachedCats = JSON.parse(cached);
        cat = cachedCats.find((c: any) => c.slug === slug);
        if (cat) return cat.id;
      }
    } catch { }

    return fallbackCategoryId();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações obrigatórias
      if (!formData.profession_raw.trim()) {
        throw new Error('Profissão/o que você faz é obrigatório');
      }
      if (!formData.city_id) {
        throw new Error('Cidade é obrigatória');
      }
      if (!formData.phone.trim()) {
        throw new Error('Telefone é obrigatório');
      }

      // Resolved fields
      const resolvedTitle = formData.service_title.trim() || formData.profession_raw.trim();
      const resolvedDescription = formData.description.trim();

      // Offline handling
      if (!navigator.onLine) {
        const { enqueue } = await import('@/lib/offlineQueue');
        const offlinePayload = {
          service_title: resolvedTitle,
          description: resolvedDescription,
          profession_raw: formData.profession_raw,
          occupation_id: formData.occupation_id,
          confidence_score: formData.confidence_score,
          category_id: inferCategoryId(),
          city_id: formData.city_id,
          neighborhood: formData.neighborhood,
          phone: formData.phone,
          availability: formData.availability,
          price: formData.price,
          _auth_id: user!.id
        };
        enqueue({ type: 'offerService', payload: offlinePayload } as any);
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

      // 3. Try to fetch occupation data if not already set
      let finalOccupationId = formData.occupation_id;
      let finalConfidenceScore = formData.confidence_score;
      let finalOccupationCategory = formData.occupation_category;

      if (!finalOccupationId && formData.profession_raw.trim()) {
        try {
          const { data: occData } = await supabase.rpc('search_ocupacoes', {
            q: formData.profession_raw,
            lim: 1,
            min_sim: 0.3
          });

          if (occData && occData.length > 0) {
            finalOccupationId = occData[0].ocupacao_id;
            finalConfidenceScore = occData[0].similarity_score;
            finalOccupationCategory = occData[0].categoria_principal || '';
          }
        } catch { }
      }

      // 4. Infer category_id
      const categoryId = inferCategoryId();

      // 5. Check schema for optional columns
      const { hasColumn } = await import('@/lib/schemaCheck');
      const [availabilityExists, professionExists, occupationIdExists, confidenceExists] = await Promise.all([
        hasColumn('worker_services', 'availability'),
        hasColumn('worker_services', 'profession_raw'),
        hasColumn('worker_services', 'occupation_id'),
        hasColumn('worker_services', 'confidence_score')
      ]);

      // 6. Build payload
      const payload: any = {
        user_id: userData.id,
        title: resolvedTitle,
        description: resolvedDescription,
        category_id: categoryId,
        price: formData.price ? parseFloat(formData.price) : null,
        active: true
      };

      if (availabilityExists) payload.availability = formData.availability;
      if (professionExists) payload.profession_raw = formData.profession_raw;
      if (occupationIdExists) payload.occupation_id = finalOccupationId;
      if (confidenceExists) payload.confidence_score = finalConfidenceScore;

      // 7. Insert worker_services
      let serviceResult: any = null;
      try {
        const { data: sdata, error: serror } = await supabase.from('worker_services').insert(payload).select();
        if (serror) throw serror;
        serviceResult = sdata;
      } catch (serviceErr: any) {
        // Fallback without optional columns if error
        if (serviceErr?.message?.toLowerCase?.().includes('column')) {
          const payloadFallback: any = {
            user_id: userData.id,
            title: resolvedTitle,
            description: resolvedDescription,
            category_id: categoryId,
            price: formData.price ? parseFloat(formData.price) : null,
            active: true
          };
          const { data: sdata2, error: serror2 } = await supabase.from('worker_services').insert(payloadFallback).select();
          if (serror2) throw serror2;
          serviceResult = sdata2;
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

              {/* Profissão / O que você faz */}
              <div className="relative">
                <Label htmlFor="profession_raw">Profissão / O que você faz *</Label>
                <Input
                  id="profession_raw"
                  placeholder="Ex: Pedreiro, Eletricista, Pintor..."
                  value={formData.profession_raw}
                  onChange={(e) => setFormData({ ...formData, profession_raw: e.target.value })}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    // Delay to allow click on suggestion
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  required
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSuggestionClick(sug);
                        }}
                      >
                        {sug.nome_oficial}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Título do Serviço (opcional) */}
              <div>
                <Label htmlFor="service_title">Título do Serviço (opcional)</Label>
                <Input
                  id="service_title"
                  placeholder="Ex: Sou pedreiro — Faço reboco, contrapiso, reformas"
                  value={formData.service_title}
                  onChange={(e) => setFormData({ ...formData, service_title: e.target.value })}
                />
              </div>

              {/* Descrição (opcional) */}
              <div>
                <Label htmlFor="description">Descrição Detalhada (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Ex: Sou pedreiro com 8 anos de experiência. Faço reboco, contrapiso, colocação de pisos, reformas e manutenções gerais. Orçamentos sem compromisso."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
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
