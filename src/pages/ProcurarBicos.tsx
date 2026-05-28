import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessControl } from "@/hooks/useAccessControl";
import { Header } from "@/components/Header";
import { SalesFooter } from "@/components/sales/SalesFooter";
import { ShareButtons } from "@/components/ShareButtons";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobDetailsModal } from "@/components/JobDetailsModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CitySelect from '@/components/CitySelect';
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonGrid } from "@/components/SkeletonGrid";
import { useToast } from "@/hooks/use-toast";
import { Search, Briefcase, Grid, List, MapPin, Clock, DollarSign, ArrowRight, Share2, Sparkles, Filter } from "lucide-react";
import { WhatsAppContactButton } from "@/components/WhatsAppContactButton";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useCities } from '@/hooks/useCities';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const ProcurarBicos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isTester, isPremium, canViewContacts, remainingFreeViews } = useAccessControl();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const [categories, setCategories] = useState<any[]>([]);
  const [hasManualCitySelection, setHasManualCitySelection] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const [filters, setFilters] = useState({
    city_id: 'all',
    category_id: 'all',
    urgent: false,
    dateFilter: 'all'
  });

  const { cities } = useCities();

  useEffect(() => {
    loadCategories();
    loadJobs();
  }, []);

  useEffect(() => {
    if (hasManualCitySelection || !cities.length || filters.city_id !== 'all') return;
    if (!user?.user_metadata?.city_id) return;

    const hasCity = cities.find(c => String(c.id) === String(user.user_metadata?.city_id));
    if (hasCity) {
      setFilters(prev => ({ ...prev, city_id: user.user_metadata?.city_id }));
    }
  }, [cities, user, hasManualCitySelection, filters.city_id]);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');
    if (!error && data) setCategories(data);
  };

  const loadJobs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('job_postings')
        .select(`
          id, title, description, price, location, city_id, category_id, urgent, created_at, status, user_id,
          category:categories(name),
          city:cities(name, state),
          user:users!user_id(name, profile_photo, plan_active, is_tester, auth_id, phone)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (searchQuery.trim()) query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      if (filters.city_id !== 'all') query = query.eq('city_id', filters.city_id);
      if (filters.category_id !== 'all') query = query.eq('category_id', filters.category_id);
      if (filters.urgent) query = query.eq('urgent', true);

      if (filters.dateFilter === 'today') query = query.gte('created_at', new Date().toISOString().split('T')[0]);
      else if (filters.dateFilter === 'week') {
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
      setJobs(data || []);
    } catch (error) {
      console.error('Erro ao buscar bicos:', error);
      toast({ title: "Erro ao buscar", description: "Não foi possível carregar os bicos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => loadJobs();

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({ city_id: 'all', category_id: 'all', urgent: false, dateFilter: 'all' });
    setTimeout(loadJobs, 100);
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

  const formatCurrency = (value: any) => {
    if (value === null || value === undefined || value === '') return 'Valor a combinar';
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-blue-500/30">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-12 pb-32">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 mb-6">
                <Sparkles className="w-3 h-3" />
                <span>Oportunidades agora</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
                Procurar <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Bicos.</span>
              </h1>
              <p className="text-muted-foreground font-medium text-xl max-w-xl leading-relaxed">
                Conecte-se a quem precisa de solução agora. Filtre por cidade, categoria e urgência.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
               <Button 
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="bg-card border-border rounded-2xl h-14 px-6 font-bold hover:scale-[1.02] active:scale-95 transition-all duration-300"
               >
                 <Filter className="w-5 h-5 mr-2" />
                 Filtros
               </Button>
               <ShareButtons 
                text="Procurando bicos? Confira no Bico Brasil!"
                url={window.location.href}
               />
            </div>
          </div>

          {/* Filters Area */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-12"
              >
                <div className="p-8 rounded-[32px] bg-card border border-border backdrop-blur-xl shadow-xl space-y-6">
                  {/* Primeira Linha: Busca e Localização */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3 md:col-span-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">O que você busca?</Label>
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-400" />
                        <Input 
                          placeholder="Ex: Pintura, Frete..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-11 h-14 bg-background border-border rounded-2xl focus:ring-blue-500/30"
                        />
                      </div>
                    </div>

                     <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Onde?</Label>
                      <Select
                        value={filters.city_id}
                        onValueChange={(v) => { setHasManualCitySelection(true); setFilters(p => ({ ...p, city_id: v })) }}
                      >
                        <SelectTrigger className="h-14 bg-background border-border rounded-2xl focus:ring-blue-500/30">
                          <SelectValue placeholder="Todas as cidades" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                          <SelectItem value="all">Todas as cidades</SelectItem>
                          {cities.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Categoria</Label>
                      <Select value={filters.category_id} onValueChange={(v) => setFilters(p => ({ ...p, category_id: v }))}>
                        <SelectTrigger className="h-14 bg-background border-border rounded-2xl focus:ring-blue-500/30">
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                          <SelectItem value="all">Todas</SelectItem>
                          {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Segunda Linha: Período, Urgência e Ações */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Período</Label>
                      <Select value={filters.dateFilter} onValueChange={(v) => setFilters(p => ({ ...p, dateFilter: v }))}>
                        <SelectTrigger className="h-14 bg-background border-border rounded-2xl focus:ring-blue-500/30">
                          <SelectValue placeholder="Qualquer data" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                          <SelectItem value="all">Qualquer data</SelectItem>
                          <SelectItem value="today">Hoje</SelectItem>
                          <SelectItem value="week">Esta semana</SelectItem>
                          <SelectItem value="month">Este mês</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Urgência</Label>
                      <div 
                        onClick={() => setFilters(p => ({ ...p, urgent: !p.urgent }))}
                        className={cn(
                          "h-14 px-6 flex items-center gap-3 rounded-2xl border transition-all cursor-pointer group",
                          filters.urgent 
                            ? "bg-red-500/10 border-red-500/30 text-red-500" 
                            : "bg-background border-border text-muted-foreground hover:border-blue-500/30"
                        )}
                      >
                        <Checkbox 
                          id="urgent-filter" 
                          checked={filters.urgent}
                          onCheckedChange={(v) => setFilters(p => ({ ...p, urgent: v as boolean }))}
                          className={cn(
                            "rounded-full border-2 transition-colors",
                            filters.urgent ? "border-red-500 data-[state=checked]:bg-red-500" : "border-muted-foreground"
                          )}
                        />
                        <Label htmlFor="urgent-filter" className="font-bold cursor-pointer select-none">Apenas Urgentes</Label>
                      </div>
                    </div>

                    <div className="flex items-end gap-3 md:col-span-2">
                       <Button onClick={handleSearch} className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-lg shadow-blue-600/20">
                          Buscar Bicos
                       </Button>
                       <Button onClick={handleClearFilters} variant="ghost" className="h-14 px-6 text-muted-foreground hover:text-foreground font-bold">
                          Limpar
                       </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Offer Services CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-8 rounded-[40px] bg-gradient-to-r from-[#FF5C35] to-[#FF451A] shadow-[0_20px_50px_rgba(255,92,53,0.3)] flex flex-col md:flex-row items-center justify-between gap-8 group"
          >
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Quer oferecer seus serviços?</h3>
              <p className="text-white/80 font-medium text-lg">Seja visto por milhares de clientes na sua região.</p>
            </div>
            <Button 
              onClick={() => navigate('/offer-services')} 
              className="h-16 px-10 bg-white text-[#FF5C35] hover:bg-zinc-100 font-black text-xl rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              Anunciar Meus Bicos
            </Button>
          </motion.div>

          {/* Results Grid */}
          {loading ? (
            <SkeletonGrid count={6} columnsClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" className="gap-8" />
          ) : jobs.length === 0 ? (
            <EmptyState 
              icon={<Briefcase className="w-20 h-20 text-zinc-700" />}
              title="Nenhum bico encontrado"
              description="Tente mudar os filtros ou a categoria. A oportunidade pode estar logo ali."
              actions={[{ label: "Limpar Filtros", onClick: handleClearFilters }]}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  <Card 
                    onClick={() => { setSelectedJob(job); setShowDetailsModal(true); }}
                    className="cursor-pointer group relative flex flex-col h-full bg-card border border-border rounded-[40px] overflow-hidden hover:border-blue-500/40 transition-all duration-500 shadow-xl"
                  >
                    <CardContent className="p-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <Badge className="bg-blue-500/10 text-blue-400 border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {job.category?.name || 'Geral'}
                        </Badge>
                        {job.urgent && (
                           <Badge className="bg-red-500 text-white border-none px-3 py-1 rounded-full text-[10px] font-black uppercase animate-pulse">
                              Urgente
                           </Badge>
                        )}
                      </div>

                      <h3 className="text-2xl font-black mb-4 leading-tight group-hover:text-blue-500 transition-colors">
                        {job.title}
                      </h3>

                      <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold mb-6">
                         <MapPin className="w-4 h-4" />
                         <span>{job.city?.name} · {job.city?.state}</span>
                      </div>

                      <p className="text-muted-foreground font-medium line-clamp-3 mb-8 flex-grow leading-relaxed">
                        {job.description}
                      </p>

                      <div className="pt-8 border-t border-border flex items-center justify-between">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Preço Sugerido</span>
                            <span className="text-2xl font-black">{formatCurrency(job.price)}</span>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Postado</span>
                            <span className="text-sm font-bold text-muted-foreground flex items-center gap-1">
                               <Clock className="w-3.5 h-3.5" />
                               {formatTimeAgo(job.created_at)}
                            </span>
                         </div>
                      </div>

                      <div className="mt-10 flex gap-3">
                         <Button className="flex-1 h-14 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-2xl font-black text-sm transition-colors">
                            Detalhes
                         </Button>
                         <button 
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
                          className="w-14 h-14 flex items-center justify-center bg-blue-500/10 text-blue-400 rounded-2xl hover:bg-blue-500/20 transition-all"
                         >
                            <Share2 className="w-5 h-5" />
                         </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <SalesFooter />

      {selectedJob && (
        <JobDetailsModal 
          job={selectedJob} 
          open={showDetailsModal} 
          onOpenChange={setShowDetailsModal} 
          canViewContacts={isTester || isPremium || canViewContacts}
          isOwner={user?.id === selectedJob.user_id}
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

