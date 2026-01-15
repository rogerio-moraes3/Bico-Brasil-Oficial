import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CitySelect from '@/components/CitySelect';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, MessageCircle, Loader2, Crown, Edit, Trash, Check, Pencil, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAccessControl } from '@/hooks/useAccessControl';
import { UpgradeModal } from '@/components/UpgradeModal';
import { expandSearchTerms } from '@/lib/searchSynonyms';
import { GeolocationSearch } from '@/components/GeolocationSearch';
import { WhatsAppContactButton } from '@/components/WhatsAppContactButton';
import { useCities } from '@/hooks/useCities';

export default function SearchWorkers() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    subcategory: 'all',
    city_id: 'all',
    neighborhood: '',
    minRating: 'all'
  });
  const [useGeolocation, setUseGeolocation] = useState(false);
  const [geoLocation, setGeoLocation] = useState<{ lat: number; lng: number; radius: number } | null>(null);

  const [workers, setWorkers] = useState<any[]>([]);
  const { cities, loading: citiesLoading } = useCities();
  const [categories, setCategories] = useState<any[]>([]);
  const [hasManualCitySelection, setHasManualCitySelection] = useState(false);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const {
    isTester,
    isPremium,
    canViewProfiles,
    remainingFreeViews
  } = useAccessControl();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');

      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      toast({
        title: "Erro ao carregar categorias",
        description: "Tente recarregar a página",
        variant: "destructive"
      });
    }
  };

  // Aplicar cidade padrão do perfil do usuário APENAS UMA VEZ (não sobrescrever escolha manual)
  useEffect(() => {
    if (hasManualCitySelection || !cities.length || filters.city_id !== 'all') return;
    if (!user?.user_metadata?.city_id) return;

    const hasCity = cities.find(c => String(c.id) === String(user.user_metadata.city_id));
    if (hasCity) {
      setFilters(prev => ({ ...prev, city_id: user.user_metadata.city_id }));
    }
  }, [cities, user, hasManualCitySelection, filters.city_id]);



  const handleCategoryChange = async (categoryId: string) => {
    setFilters({ ...filters, category: categoryId, subcategory: 'all' });

    if (categoryId && categoryId !== 'all') {
      const { data } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId);

      setSubcategories(data || []);
    } else {
      setSubcategories([]);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    setError(null);

    try {

      // Check schema: availability may not exist in every environment
      const { hasColumn } = await import('@/lib/schemaCheck');
      const availabilityExists = await hasColumn('worker_services', 'availability');

      let selectFields = 'id, user_id, title, description, price, custom_category, category_id, subcategory_id, active, category:categories(name), subcategory:subcategories(name)';
      if (availabilityExists) selectFields = 'id, user_id, title, description, price, custom_category, availability, category_id, subcategory_id, active, category:categories(name), subcategory:subcategories(name)';

      let servicesQuery = supabase
        .from('worker_services')
        .select(selectFields)
        .eq('active', true); // Only show active services

      if (filters.category !== 'all') {
        servicesQuery = servicesQuery.eq('category_id', filters.category);
      }

      if (filters.subcategory !== 'all') {
        servicesQuery = servicesQuery.eq('subcategory_id', filters.subcategory);
      }

      if (searchQuery.trim()) {
        const expandedTerms = expandSearchTerms(searchQuery);
        const orConditions = expandedTerms.map(term =>
          `title.ilike.%${term}%,description.ilike.%${term}%`
        ).join(',');
        servicesQuery = servicesQuery.or(orConditions);
      }

      let servicesData: any = null;
      try {
        const res = await servicesQuery;
        servicesData = res.data;
        if (res.error) throw res.error;
      } catch (servicesError: any) {
        // If availability column is not present in schema, retry without it
        if (servicesError?.message?.toLowerCase?.().includes('availability')) {
          console.warn('Availability column missing; retrying service query without it');
          servicesQuery = supabase
            .from('worker_services')
            .select('id, user_id, title, description, price, custom_category, category_id, subcategory_id, active, category:categories(name), subcategory:subcategories(name)');
          const res2 = await servicesQuery;
          if (res2.error) throw res2.error;
          servicesData = res2.data;
        } else {
          console.error('❌ Erro ao buscar serviços:', servicesError);
          throw servicesError;
        }
      }

      if (!servicesData || servicesData.length === 0) {
        setWorkers([]);
        setError("Nenhum profissional encontrado. Tente ajustar sua busca.");
        setLoading(false);
        return;
      }

      // FASE 3: Buscar usuários com filtros aplicados
      const userIds = servicesData.map(s => s.user_id);

      // Query users table directly instead of view for reliability
      let usersQuery = supabase
        .from('users')
        .select(`
          id, 
          name, 
          city, 
          city_id,
          neighborhood, 
          profile_photo,
          verified, 
          rating_avg, 
          rating_count, 
          jobs_done, 
          created_at, 
          destaque_expires_at, 
          plan_active, 
          type
        `)
        .in('id', userIds)
        .eq('type', 'worker');

      // Aplicar filtro de cidade
      if (filters.city_id !== 'all') {
        const selectedCity = cities.find(c => c.id === filters.city_id);
        usersQuery = usersQuery.eq('city_id', filters.city_id);
      } else {
        // sem filtro de cidade
      }

      // Aplicar filtro de bairro
      if (filters.neighborhood.trim()) {
        usersQuery = usersQuery.ilike('neighborhood', `%${filters.neighborhood.trim()}%`);
      }

      // Aplicar filtro de avaliação mínima
      if (filters.minRating !== 'all') {
        usersQuery = usersQuery.gte('rating_avg', Number(filters.minRating));
      }

      const { data: usersData, error: usersError } = await usersQuery;

      if (usersError) {
        console.error('❌ Erro ao buscar usuários:', usersError);
        throw usersError;
      }



      // FASE 4: Combinar e processar resultados com badges
      const combined = (usersData || []).map(user => {
        const service = servicesData.find(s => s.user_id === user.id);
        const hasDestaque = user.destaque_expires_at && new Date(user.destaque_expires_at) > new Date();
        const isPremium = user.plan_active || false;

        return {
          id: user.id,
          name: user.name,
          city: user.city,
          city_id: user.city_id,
          neighborhood: user.neighborhood,
          profile_photo: user.profile_photo,
          verified: user.verified,
          rating_avg: user.rating_avg,
          rating_count: user.rating_count,
          jobs_done: user.jobs_done,
          created_at: user.created_at,
          destaque_expires_at: user.destaque_expires_at,
          plan_active: user.plan_active,
          service_id: service?.id,
          service_title: service?.title || 'Serviço sem título',
          service_description: service?.description || 'Sem descrição',
          category_name: service?.category?.name || 'Não especificado',
          subcategory_name: service?.subcategory?.name || '',
          price: service?.price || null,
          availability: service?.availability || '',
          hasDestaque,
          isPremium
        };
      });

      // Ordenar: Destaque > Premium > Rating
      combined.sort((a, b) => {
        if (a.hasDestaque && !b.hasDestaque) return -1;
        if (!a.hasDestaque && b.hasDestaque) return 1;
        if (a.isPremium && !b.isPremium) return -1;
        if (!a.isPremium && b.isPremium) return 1;
        return (b.rating_avg || 0) - (a.rating_avg || 0);
      });


      setWorkers(combined);

      if (combined.length === 0) {
        setError("Nenhum profissional encontrado. Tente remover alguns filtros ou usar palavras-chave diferentes.");
      } else {
        setError(null);
      }
    } catch (err: any) {
      console.error("Erro na busca:", err);
      setError("Ocorreu um erro ao buscar profissionais. Tente novamente.");
      toast({
        title: "Erro na busca",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />


      {/* Banner de acesso para testers */}
      {isTester && (
        <div className="bg-purple-900/30 border-b border-purple-500/30 py-3">
          <div className="container mx-auto px-4 flex items-center gap-2">
            <Badge className="bg-purple-600">BETA TESTER</Badge>
            <span className="text-sm text-foreground">
              Você tem acesso ilimitado a todos os recursos 🎉
            </span>
          </div>
        </div>
      )}

      {/* Banner de limite para usuários gratuitos */}
      {!isTester && !isPremium && (
        <div className="bg-yellow-900/30 border-b border-yellow-500/30 py-3">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-foreground">
                {remainingFreeViews > 0
                  ? `Você tem ${remainingFreeViews} visualizações gratuitas restantes`
                  : 'Limite de visualizações atingido'}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/premium')}
              className="border-yellow-500 text-yellow-400 hover:bg-yellow-900/50"
            >
              Assinar Premium
            </Button>
          </div>
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 py-8 pb-20 md:pb-8">
        <h1 className="text-3xl font-bold mb-8">Buscar Profissionais</h1>

        <Card className="mb-8">
          <CardContent className="p-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label>Categoria</Label>
                <Select value={filters.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {subcategories.length > 0 && (
                <div>
                  <Label>Subcategoria</Label>
                  <Select value={filters.subcategory} onValueChange={(value) => setFilters({ ...filters, subcategory: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Cidade</Label>
                <Select
                  value={filters.city_id}
                  onValueChange={(value) => {
                    setHasManualCitySelection(true);
                    setFilters(prev => ({ ...prev, city_id: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>{city.name} - {city.state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label>Bairro</Label>
                <Input
                  placeholder="Digite o bairro"
                  value={filters.neighborhood}
                  onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value })}
                />
              </div>

              <div>
                <Label>Avaliação Mínima</Label>
                <Select value={filters.minRating} onValueChange={(value) => setFilters({ ...filters, minRating: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Qualquer</SelectItem>
                    <SelectItem value="4">4+ estrelas</SelectItem>
                    <SelectItem value="4.5">4.5+ estrelas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Buscar por palavra-chave</Label>
                <Input
                  placeholder="Ex: Encanador..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  'Buscar'
                )}
              </Button>
              <Button
                onClick={() => {
                  setFilters({
                    category: 'all',
                    subcategory: 'all',
                    city_id: 'all',
                    neighborhood: '',
                    minRating: 'all'
                  });
                  setHasManualCitySelection(false);
                  setSearchQuery('');
                  setUseGeolocation(false);
                  setGeoLocation(null);
                }}
                variant="outline"
                disabled={loading}
              >
                Limpar
              </Button>
            </div>

            {/* Geolocalização */}
            <div className="pt-4 border-t">
              <GeolocationSearch
                onLocationChange={(lat, lng, radius) => setGeoLocation({ lat, lng, radius })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contador de resultados */}
        {searched && !loading && !error && workers.length > 0 && (
          <div className="mb-4 text-sm text-muted-foreground">
            Encontrados {workers.length} profissionai{workers.length !== 1 ? 's' : ''}
            {filters.category !== 'all' && ` em ${categories.find(c => c.id === filters.category)?.name}`}
            {filters.city_id !== 'all' && ` em ${cities.find(c => c.id === filters.city_id)?.name}`}
          </div>
        )}

        {/* CTA sempre visível - Publicar Vaga */}
        <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500/30 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-lg mb-2">Não encontrou o profissional ideal?</h3>
              <p className="text-white/80">
                Publique sua vaga e deixe que os profissionais venham até você!
              </p>
            </div>
            <Button onClick={() => navigate('/post-job')} size="lg" className="whitespace-nowrap bg-card text-foreground border-border rounded-xl hover:bg-muted">
              <Briefcase className="mr-2 h-4 w-4" />
              Publicar Vaga
            </Button>
          </div>
        </Card>

        {searched && (
          <div className="space-y-6">

            {error ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">{error}</p>
              </Card>
            ) : workers.length === 0 && searched ? (
              <Card className="p-8 text-center">
                <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum profissional encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  Não encontrou o profissional que precisa? Publique uma vaga e deixe que eles venham até você!
                </p>
                <Button onClick={() => navigate('/post-job')} variant="outline" size="lg" className="border-orange-600 text-orange-600 dark:border-border dark:text-foreground">
                  Publicar Vaga
                </Button>
              </Card>
            ) : workers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">
                {workers.map((worker) => {
                  const isOwner = user?.id === worker.id;

                  return (
                    <Card key={worker.id} className="h-full hover:shadow-lg transition-shadow">
                      <Link
                        to={`/worker/${worker.id}`}
                        onClick={(e) => {
                          if (!canViewProfiles) {
                            e.preventDefault();
                            setShowUpgradeModal(true);
                          }
                        }}
                        className="block"
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center gap-4 mb-4">
                            <div className="relative">
                              <Avatar className="h-24 w-24">
                                <AvatarImage
                                  src={worker.profile_photo || ''}
                                  alt={worker.name}
                                />
                                <AvatarFallback>
                                  {worker.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {worker.verified && (
                                <Badge className="absolute -top-1 -right-1 bg-blue-500">
                                  <Check className="h-3 w-3" />
                                </Badge>
                              )}
                            </div>

                            <div className="text-center w-full">
                              <h3 className="font-semibold text-lg mb-1">{worker.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {worker.city}
                                {worker.neighborhood && ` - ${worker.neighborhood}`}
                              </p>
                              <p className="text-sm font-medium text-primary mb-3">
                                {worker.service_title || worker.category}
                              </p>

                              <div className="flex gap-2 justify-center flex-wrap mb-3">
                                {worker.destaque_expires_at && new Date(worker.destaque_expires_at) > new Date() && (
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                    ⭐ Destaque
                                  </Badge>
                                )}
                                {worker.plan_active && (
                                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                    💎 Premium
                                  </Badge>
                                )}
                              </div>

                              {worker.rating_avg > 0 && (
                                <div className="flex items-center justify-center gap-1 text-sm">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium">{worker.rating_avg && typeof worker.rating_avg === 'number' && !isNaN(worker.rating_avg) ? worker.rating_avg.toFixed(1) : '0.0'}</span>
                                  <span className="text-muted-foreground">
                                    ({worker.rating_count} {worker.rating_count === 1 ? 'avaliação' : 'avaliações'})
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {worker.service_description && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {worker.service_description}
                            </p>
                          )}

                          {isOwner && (
                            <div className="flex gap-2 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(`/edit-service/${worker.service_id}`);
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Link>

                      {!isOwner && worker.phone && (
                        <div className="px-6 pb-6 pt-2 border-t">
                          <WhatsAppContactButton
                            phone={worker.phone}
                            workerName={worker.name}
                            canViewContact={canViewProfiles}
                            remainingViews={remainingFreeViews}
                            onUpgradeClick={() => setShowUpgradeModal(true)}
                          />
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : null}
          </div>
        )}
      </main>

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        remainingViews={remainingFreeViews}
      />

      <Footer />
    </div>
  );
}
