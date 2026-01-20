import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessControl } from "@/hooks/useAccessControl";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShareButtons } from "@/components/ShareButtons";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobDetailsModal } from "@/components/JobDetailsModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CitySelect from '@/components/CitySelect';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, Briefcase, Grid, List, MapPin, Clock, DollarSign, AlertCircle, Loader2, Edit, Trash, Share2 } from "lucide-react";
import { WhatsAppContactButton } from "@/components/WhatsAppContactButton";
import { UpgradeModal } from "@/components/UpgradeModal";
import { getJobExpirationStatus } from "@/utils/jobExpiration";
import { useCities } from '@/hooks/useCities';

const ProcurarBicos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isTester, isPremium, canViewContacts, remainingFreeViews } = useAccessControl();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [hasManualCitySelection, setHasManualCitySelection] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showingCached, setShowingCached] = useState(false);

  const [filters, setFilters] = useState({
    city_id: 'all',
    category_id: 'all',
    subcategory_id: 'all',
    urgent: false,
    minValue: '',
    maxValue: '',
    dateFilter: 'all'
  });

  const { cities, loading: citiesLoading } = useCities();

  // Carregar categorias
  useEffect(() => {
    loadCategories();
  }, []);

  // Aplicar cidade padrão do perfil do usuário APENAS UMA VEZ (não sobrescrever escolha manual)
  useEffect(() => {
    if (hasManualCitySelection || !cities.length || filters.city_id !== 'all') return;
    if (!user?.user_metadata?.city_id) return;

    const hasCity = cities.find(c => String(c.id) === String(user.user_metadata?.city_id));
    if (hasCity) {
      setFilters(prev => ({ ...prev, city_id: user.user_metadata?.city_id }));
    }
  }, [cities, user, hasManualCitySelection, filters.city_id]);

  // Carregar subcategorias quando categoria mudar
  useEffect(() => {
    if (filters.category_id !== 'all') {
      loadSubcategories(filters.category_id);
    } else {
      setSubcategories([]);
      setFilters(prev => ({ ...prev, subcategory_id: 'all' }));
    }
  }, [filters.category_id]);

  // Manual search only: loadJobs is triggered by explicit user action (magnifying glass / Buscar button)
  // Removed automatic trigger on filters change to avoid unexpected network calls and UX surprises.

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    if (!error && data) {
      setCategories(data);
    }
  };

  const loadSubcategories = async (categoryId: string) => {
    const { data, error } = await supabase
      .from('subcategories')
      .select('id, name')
      .eq('category_id', categoryId)
      .order('name');

    if (!error && data) {
      setSubcategories(data);
    }
  };

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      setShowingCached(false);
      // Try process offline queue when back online
      import('@/lib/offlineHandlers').then(({ processOfflineQueue }) => {
        processOfflineQueue().then((res) => {
          if (res && res.processed) {
            // dispatch event - NotificationPrompt listens and shows toast
            window.dispatchEvent(new CustomEvent('offlineQueueProcessed', { detail: res }));
          }
        }).catch(err => console.error('Error processing offline queue', err));
      });

      loadJobs();
    };

    const onOffline = () => {
      setIsOnline(false);
      toast({ title: 'Sem internet no momento', description: 'Mostrando últimos dados disponíveis quando possível', variant: 'destructive' });
      // Try load cached results if available
      loadJobs();
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const loadJobs = async () => {
    setLoading(true);

    // Build a cache key based on filters and search
    const cacheKey = `jobs_cache_${filters.city_id}_${filters.category_id}_${filters.dateFilter}_${filters.urgent}_${searchQuery}`;

    try {
      if (!navigator.onLine) throw new Error('offline');

      let query = supabase
        .from('job_postings')
        .select(`
          id,
          title,
          description,
          price,
          location,
          city_id,
          category_id,
          urgent,
          created_at,
          status,
          active,
          user_id,
          category:categories(name),
          city:cities(name, state),
          user:users!user_id(name, profile_photo, plan_active, is_tester, auth_id, phone)
        `)
        .eq('status', 'open')
        .eq('active', true) // CRITICAL: Only show active jobs, hide deleted ones
        .order('created_at', { ascending: false });

      // Filtro de busca textual
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Filtro de cidade
      if (filters.city_id !== 'all') {
        query = query.eq('city_id', filters.city_id);
      }

      // Filtro de categoria
      if (filters.category_id !== 'all') {
        query = query.eq('category_id', filters.category_id);
      }

      // Nota: job_postings não tem subcategory_id (só workers_services tem)

      // Filtro de urgência
      if (filters.urgent) {
        query = query.eq('urgent', true);
      }

      // Filtro de data
      if (filters.dateFilter === 'today') {
        query = query.gte('created_at', new Date().toISOString().split('T')[0]);
      } else if (filters.dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('created_at', weekAgo.toISOString());
      } else if (filters.dateFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('created_at', monthAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Save cache for offline use
      try { localStorage.setItem(cacheKey, JSON.stringify({ jobs: data, timestamp: Date.now() })); } catch (_) { }

      setJobs(data || []);
      setShowingCached(false);
    } catch (error) {
      console.error('Erro ao buscar bicos:', error);

      // Try to show cached data
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          setJobs(parsed.jobs || []);
          setShowingCached(true);
          toast({ title: 'Mostrando últimos dados disponíveis', description: 'Sem internet no momento', variant: 'warning' });
        } else {
          toast({
            title: "Erro ao buscar",
            description: "Não foi possível carregar os bicos",
            variant: "destructive"
          });
        }
      } catch (err) {
        toast({
          title: "Erro ao buscar",
          description: "Não foi possível carregar os bicos",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadJobs();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      city_id: 'all',
      category_id: 'all',
      subcategory_id: 'all',
      urgent: false,
      minValue: '',
      maxValue: '',
      dateFilter: 'all'
    });
    setTimeout(loadJobs, 100);
  };

  const handleViewJob = (job: any) => {

    setSelectedJob(job);
    setShowDetailsModal(true);
  };

  // Verificar se o usuário é dono do job
  const isJobOwner = (job: any) => {
    if (!user) return false;

    // Comparar auth_id do job.user com o auth_id do usuário logado
    // Incluir fallback verificando user_id diretamente caso o join falhe
    const isOwner = job.user?.auth_id === user.id || job.user_id === user.id;

    return isOwner;
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${Math.floor(diffMs / 86400000)}d atrás`;
  };

  const formatJobDate = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

    if (sameDay(d, today)) return 'Hoje';
    if (sameDay(d, tomorrow)) return 'Amanhã';

    return d.toLocaleDateString();
  };

  const formatCurrency = (value: any) => {
    if (value === null || value === undefined || value === '') return '—';
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(num);
  };

  const handleDeleteJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Tem certeza que deseja excluir este anúncio?')) return;

    try {
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('❌ Erro RLS ao excluir:', error);
        toast({
          title: "Erro ao excluir",
          description: error.code === '42501'
            ? "Você não tem permissão para excluir este anúncio."
            : `Erro: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      toast({ title: "Anúncio excluído com sucesso" });
      loadJobs();
    } catch (err) {
      console.error('Erro inesperado:', err);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />


      <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6 overflow-y-auto">
        <Breadcrumbs />

        {(showingCached || !isOnline) && (
          <div className="mb-4 rounded-md bg-yellow-50 border border-yellow-200 p-3 text-yellow-800">
            {!isOnline ? (
              <strong>Sem internet no momento</strong>
            ) : (
              <strong>Mostrando últimos dados disponíveis</strong>
            )}
            <div className="text-sm">Os resultados podem estar desatualizados; serão atualizados quando a conexão voltar.</div>
          </div>
        )}

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Procurar Bicos</h1>
            <p className="text-muted-foreground">Encontre oportunidades de trabalho na sua região</p>
          </div>
          <ShareButtons
            text="Procurando bicos? Encontre oportunidades de trabalho no Bico Brasil!"
            url="https://bicobrasil.com.br/procurar-bicos"
          />
        </div>

        {/* Filtros */}
        <Card className="mb-6 container-outline bg-card shadow-sm">
          <CardContent className="pt-6 space-y-4">
            {/* Linha 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Digite o tipo de bico..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <CitySelect
                value={filters.city_id}
                onChange={(value) => {
                  setHasManualCitySelection(true);
                  setFilters(prev => ({ ...prev, city_id: value }));
                }}
                cities={cities}
                includeAll={true}
                placeholder="Todas as cidades"
              />

              <Select value={filters.category_id} onValueChange={(value) => setFilters(prev => ({ ...prev, category_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Linha 2 */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <Select value={filters.dateFilter} onValueChange={(value) => setFilters(prev => ({ ...prev, dateFilter: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgent"
                  checked={filters.urgent}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, urgent: checked as boolean }))}
                />
                <Label htmlFor="urgent" className="cursor-pointer">Apenas urgentes</Label>
              </div>

              <div className="flex gap-2 md:col-span-3">
                <Button onClick={handleSearch} className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
                <Button onClick={handleClearFilters} variant="outline">
                  Limpar
                </Button>
                <Button
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  variant="outline"
                  size="icon"
                >
                  {viewMode === 'list' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA sempre visível - Oferecer Serviços */}
        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 border-green-400/30 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-lg mb-2">Quer oferecer seus serviços?</h3>
              <p className="text-white/80">
                Cadastre-se como profissional e apareça nas buscas para receber propostas de trabalho!
              </p>
            </div>
            <Button onClick={() => navigate('/offer-services')} variant="outline" size="lg" className="whitespace-nowrap border-orange-600 text-orange-600 dark:border-border dark:text-foreground">
              <Briefcase className="mr-2 h-4 w-4" />
              Oferecer Serviços
            </Button>
          </div>
        </Card>

        {/* Resultados */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum bico encontrado</h3>
            <p className="text-muted-foreground mb-6">
              Quer oferecer seus serviços e aparecer nas buscas? Cadastre-se como profissional!
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleClearFilters} variant="outline">Limpar Filtros</Button>
              <Button onClick={() => navigate('/offer-services')} variant="outline" size="lg" className="border-orange-600 text-orange-600 dark:border-border dark:text-foreground">Oferecer Serviços</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 place-items-center">
            {jobs.map((job) => (
              <Card key={job.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 rounded-xl border max-w-sm w-full" onClick={() => handleViewJob(job)}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="space-y-2">
                      {job.category?.name && (
                        <Badge className="text-xs font-medium" variant="secondary">{job.category.name}</Badge>
                      )}
                      <h3 className="font-bold text-base leading-tight">{job.title}</h3>
                    </div>

                    {/* Location */}
                    {job.city?.name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{job.city.name}{job.neighborhood ? ` — ${job.neighborhood}` : ''}</span>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

                    {/* Price and Time */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-base font-bold">{formatCurrency(job.price)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(job.created_at)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {/* Share Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          const shareUrl = `${window.location.origin}/job/${job.id}`;
                          const shareText = `Vaga no Bico Brasil: ${job.title} - ${formatCurrency(job.price)}. Cadastre-se em ${window.location.origin}`;

                          if (navigator.share) {
                            navigator.share({ title: job.title, text: shareText, url: shareUrl });
                          } else {
                            navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                            toast({ title: "Link copiado!", description: "Cole e compartilhe com seus amigos" });
                          }
                        }}
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Compartilhar
                      </Button>
                    </div>

                    {/* WhatsApp Contact Button */}
                    {job.user?.phone && user?.id !== job.user_id && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <WhatsAppContactButton
                          phone={job.user.phone}
                          workerName={job.user.name || 'Contratante'}
                          canViewContact={canViewContacts}
                          remainingViews={remainingFreeViews}
                          onUpgradeClick={() => setShowUpgradeModal(true)}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
          canViewContacts={isTester || isPremium || canViewContacts}
          isOwner={isJobOwner(selectedJob)}
        />
      )}

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        remainingViews={remainingFreeViews}
      />
    </div>
  );
};

export default ProcurarBicos;
