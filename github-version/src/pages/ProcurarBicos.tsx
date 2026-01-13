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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, Briefcase, Grid, List, MapPin, Clock, DollarSign, AlertCircle, Loader2, Edit, Trash } from "lucide-react";
import { WhatsAppContactButton } from "@/components/WhatsAppContactButton";
import { UpgradeModal } from "@/components/UpgradeModal";
import { getJobExpirationStatus } from "@/utils/jobExpiration";

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

  const [cities, setCities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    city_id: 'all',
    category_id: 'all',
    subcategory_id: 'all',
    urgent: false,
    minValue: '',
    maxValue: '',
    dateFilter: 'all'
  });

  // Carregar cidades e categorias
  useEffect(() => {
    loadCities();
    loadCategories();
  }, []);

  // Carregar subcategorias quando categoria mudar
  useEffect(() => {
    if (filters.category_id !== 'all') {
      loadSubcategories(filters.category_id);
    } else {
      setSubcategories([]);
      setFilters(prev => ({ ...prev, subcategory_id: 'all' }));
    }
  }, [filters.category_id]);

  // Carregar jobs quando filtros mudarem
  useEffect(() => {
    loadJobs();
  }, []);

  const loadCities = async () => {
    const { data, error } = await supabase
      .from('cities')
      .select('id, name, state')
      .eq('active', true)
      .order('name');

    if (!error && data) {
      setCities(data);
    }
  };

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

  const loadJobs = async () => {
    setLoading(true);
    try {
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
          user_id,
          category:categories(name),
          city:cities(name, state),
          user:users!user_id(name, profile_photo, plan_active, is_tester, auth_id, phone)
        `)
        .eq('status', 'open')
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

      console.log('📞 Jobs carregados:', {
        total: data?.length,
        sample: data?.[0] ? {
          id: data[0].id,
          title: data[0].title,
          user: data[0].user,
          user_phone: data[0].user?.phone
        } : 'Nenhum job'
      });

      setJobs(data || []);
    } catch (error) {
      console.error('Erro ao buscar bicos:', error);
      toast({
        title: "Erro ao buscar",
        description: "Não foi possível carregar os bicos",
        variant: "destructive"
      });
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
    console.log('🎯 Abrindo modal para job:', {
      id: job.id,
      title: job.title,
      user: job.user,
      phone: job.user?.phone
    });
    setSelectedJob(job);
    setShowDetailsModal(true);
  };

  // Verificar se o usuário é dono do job
  const isJobOwner = (job: any) => {
    if (!user) return false;

    console.log('🔍 Verificando ownership do anúncio:', {
      job_id: job.id,
      job_title: job.title,
      job_user_id: job.user_id,
      job_user_auth_id: job.user?.auth_id,
      current_user_id: user.id
    });

    // Comparar auth_id do job.user com o auth_id do usuário logado
    // Incluir fallback verificando user_id diretamente caso o join falhe
    const isOwner = job.user?.auth_id === user.id || job.user_id === user.id;
    console.log('✅ Resultado ownership:', isOwner);

    return isOwner;
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
  };

  const handleDeleteJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Tem certeza que deseja excluir este anúncio?')) return;

    try {
      console.log('🗑️ Tentando excluir anúncio:', jobId);

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

      console.log('✅ Anúncio excluído com sucesso');
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
        <Card className="mb-6 border border-border shadow-sm">
          <CardContent className="pt-6 space-y-4">
            {/* Linha 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Digite o tipo de bico..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>

              <Select value={filters.city_id} onValueChange={(value) => setFilters(prev => ({ ...prev, city_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as cidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as cidades</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name} - {city.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
            <Button onClick={() => navigate('/offer-services')} variant="outline" size="lg" className="whitespace-nowrap border-orange-600 text-orange-600 dark:border-white dark:text-white">
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
              <Button onClick={() => navigate('/offer-services')}>Oferecer Serviços</Button>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-4' : 'space-y-4'}>
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewJob(job)}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar className="h-16 w-16 flex-shrink-0">
                      <AvatarImage src={job.user?.profile_photo} />
                      <AvatarFallback>{job.user?.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{job.title}</h3>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {(() => {
                              const expirationStatus = getJobExpirationStatus(job.date_time);
                              return (
                                <>
                                  {expirationStatus.isExpired && (
                                    <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
                                      ⏰ Expirado
                                    </Badge>
                                  )}
                                  {expirationStatus.showWarning && (
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                                      ⚠️ Expira em {expirationStatus.daysUntilExpiration} dia(s)
                                    </Badge>
                                  )}
                                </>
                              );
                            })()}
                            {job.urgent && <Badge variant="destructive">🔥 Urgente</Badge>}
                            {job.category?.name && <Badge variant="secondary">{job.category.name}</Badge>}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {job.city?.name && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.city.name} - {job.neighborhood}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTimeAgo(job.created_at)}
                        </div>
                      </div>

                      {/* Botões de Editar/Excluir - apenas para o próprio usuário */}
                      {user && isJobOwner(job) && (
                        <div className="flex gap-2 mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/edit-job/${job.id}`);
                            }}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" /> Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => handleDeleteJob(job.id, e)}
                            className="flex-1"
                          >
                            <Trash className="h-4 w-4 mr-1" /> Excluir
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* WhatsApp Contact Button */}
                  {job.user?.phone && user?.id !== job.user_id && (
                    <div className="px-4 pb-4 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
                      <WhatsAppContactButton
                        phone={job.user.phone}
                        workerName={job.user.name || 'Contratante'}
                        canViewContact={canViewContacts}
                        remainingViews={remainingFreeViews}
                        onUpgradeClick={() => setShowUpgradeModal(true)}
                      />
                    </div>
                  )}
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
