import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { BarChart3, Users, Briefcase, Eye, TrendingUp, UserCheck, Crown, Download, Filter, Star, MessageSquare, Heart, Activity, DollarSign, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

// Admin authentication uses server-side role verification via user_roles table

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Filtros temporais
  const [timeFilter, setTimeFilter] = useState<'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'lastMonth' | 'custom'>('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [metrics, setMetrics] = useState({
    // Leads (Lista VIP)
    totalLeads: 0,
    leadsByType: { fazer_bico: 0, anunciar_servico: 0 },
    leadsByCity: [] as any[],
    leadsToday: 0,
    leadsThisWeek: 0,
    leadsThisMonth: 0,

    // Usuários
    totalUsers: 0,
    activeUsers7Days: 0,
    prestadores: 0,
    empregadores: 0,
    verifiedUsers: 0,
    activeSubscriptions: 0,
    betaTesters: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,

    // Anúncios (Jobs)
    totalJobs: 0,
    activeJobs: 0,
    inactiveJobs: 0,
    urgentJobs: 0,
    jobsByCategory: [] as any[],
    jobsByCity: [] as any[],

    // Serviços (Worker Services)
    totalServices: 0,
    activeServices: 0,
    servicesByCategory: [] as any[],
    avgPriceByCategory: [] as any[],

    // Engajamento
    totalProfileViews: 0,
    viewsToday: 0,
    viewsThisWeek: 0,
    viewsThisMonth: 0,
    totalContactUnlocks: 0,
    conversionRate: 0,
    totalFavorites: 0,

    // Financeiro
    totalPayments: 0,
    totalRevenue: 0,
    activeSubscriptionsCount: 0,
    destaqueOrders: 0,
    avgTicket: 0,
    pendingPayments: 0,
    approvedPayments: 0,

    // Avaliações
    totalRatings: 0,
    avgRating: 0,
    ratingDistribution: [] as any[],

    // Comunidade
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,

    // Gráficos
    signupsByDay: [] as any[],
    categoriesCount: [] as any[]
  });

  const [leads, setLeads] = useState<any[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');

  // Atividade recente
  const [recentActivity, setRecentActivity] = useState({
    recentSignups: [] as any[],
    recentJobs: [] as any[],
    recentViews: [] as any[],
    recentPayments: [] as any[]
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  // Polling automático a cada 60 segundos
  useEffect(() => {
    if (!isAdmin) return;

    const interval = setInterval(() => {
      console.log('🔄 Atualizando métricas automaticamente...');
      loadAllData();
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    try {
      // Verificar se usuário está logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        navigate('/landing');
        return;
      }

      // Verificar se tem role de admin via user_roles table (server-side RLS enforced)
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) {
        console.error('Error checking admin role:', roleError);
      }

      // Também verificar na whitelist de colaboradores como fallback (case-insensitive)
      const { data: colaboradorData } = await supabase
        .from('colaboradores_autorizados')
        .select('email')
        .ilike('email', user.email || '')
        .maybeSingle();

      // Admin access se tem role admin OU está na whitelist de colaboradores
      if (!roleData && !colaboradorData) {
        toast.error('Acesso não autorizado');
        navigate('/landing');
        return;
      }

      setUserEmail(user.email || '');
      setIsAdmin(true);
      loadAllData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      toast.error('Erro ao verificar acesso');
      navigate('/landing');
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadLeadsMetrics(),
        loadUsersMetrics(),
        loadJobsMetrics(),
        loadServicesMetrics(),
        loadEngagementMetrics(),
        loadFinancialMetrics(),
        loadRatingsMetrics(),
        loadCommunityMetrics(),
        loadRecentActivity(),
        loadLeads()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let startDate: Date;
    let endDate = new Date();

    switch (timeFilter) {
      case 'today':
        startDate = today;
        break;
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        startDate = yesterday;
        endDate = new Date(today.getTime() - 1); // Fim do dia anterior
        break;
      case '7days':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0); // Último dia do mês anterior
        break;
      case 'custom':
        startDate = customStartDate ? new Date(customStartDate) : new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = customEndDate ? new Date(customEndDate) : new Date();
        break;
      default:
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  };

  const loadLeadsMetrics = async () => {
    // CORREÇÃO CRÍTICA: Buscar da tabela users (usuários reais) ao invés de registrations
    const { data: usersData, count: totalLeads } = await supabase
      .from('users')
      .select('*', { count: 'exact' });

    const { startDate, endDate } = getDateRange();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const filteredUsers = usersData?.filter(u => {
      const date = new Date(u.created_at);
      return date >= startDate && date <= endDate;
    });

    const leadsToday = usersData?.filter(u => new Date(u.created_at) >= today).length || 0;
    const leadsThisWeek = usersData?.filter(u => new Date(u.created_at) >= weekAgo).length || 0;
    const leadsThisMonth = usersData?.filter(u => new Date(u.created_at) >= monthAgo).length || 0;

    // Mapear user_role para tipo: prestador = fazer_bico, empregador = anunciar_servico
    const leadsByType = {
      fazer_bico: filteredUsers?.filter(u => u.user_role === 'prestador' || u.type === 'worker').length || 0,
      anunciar_servico: filteredUsers?.filter(u => u.user_role === 'empregador').length || 0
    };

    const cityCounts: any = {};
    filteredUsers?.forEach((user: any) => {
      const city = user.city || 'Não especificado';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    const leadsByCity = Object.entries(cityCounts).map(([name, value]) => ({ name, value }));

    setMetrics(prev => ({
      ...prev,
      totalLeads: totalLeads || 0,
      leadsByType,
      leadsByCity,
      leadsToday,
      leadsThisWeek,
      leadsThisMonth
    }));
  };

  const loadUsersMetrics = async () => {
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data: usersData } = await supabase
      .from('users')
      .select('type, user_role, verified, plan_active, is_tester, created_at, last_usage_at');

    const activeUsers7Days = usersData?.filter(u => u.last_usage_at && new Date(u.last_usage_at) >= sevenDaysAgo).length || 0;
    const prestadores = usersData?.filter(u => u.type === 'worker').length || 0;
    const empregadores = usersData?.filter(u => u.user_role === 'empregador').length || 0;
    const verifiedUsers = usersData?.filter(u => u.verified).length || 0;
    const activeSubscriptions = usersData?.filter(u => u.plan_active).length || 0;
    const betaTesters = usersData?.filter(u => u.is_tester).length || 0;
    const newUsersToday = usersData?.filter(u => new Date(u.created_at) >= today).length || 0;
    const newUsersThisWeek = usersData?.filter(u => new Date(u.created_at) >= weekAgo).length || 0;
    const newUsersThisMonth = usersData?.filter(u => new Date(u.created_at) >= monthAgo).length || 0;

    // Cadastros por dia (últimos 30 dias)
    const signupsByDay: any = {};
    usersData?.forEach((user: any) => {
      const date = new Date(user.created_at).toLocaleDateString('pt-BR');
      signupsByDay[date] = (signupsByDay[date] || 0) + 1;
    });

    const signupsArray = Object.entries(signupsByDay)
      .map(([date, count]) => ({ date, count }))
      .slice(0, 30)
      .reverse();

    setMetrics(prev => ({
      ...prev,
      totalUsers: totalUsers || 0,
      activeUsers7Days,
      prestadores,
      empregadores,
      verifiedUsers,
      activeSubscriptions,
      betaTesters,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      signupsByDay: signupsArray
    }));
  };

  const loadJobsMetrics = async () => {
    const { count: totalJobs } = await supabase
      .from('job_postings')
      .select('*', { count: 'exact', head: true });

    const { data: jobsData } = await supabase
      .from('job_postings')
      .select('status, urgent, category_id, city_id, categories(name), cities(name)');

    const activeJobs = jobsData?.filter(j => j.status === 'open').length || 0;
    const inactiveJobs = jobsData?.filter(j => j.status !== 'open').length || 0;
    const urgentJobs = jobsData?.filter(j => j.urgent).length || 0;

    const categoryCounts: any = {};
    jobsData?.forEach((job: any) => {
      const catName = job.categories?.name || 'Outros';
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });

    const jobsByCategory = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

    const cityCounts: any = {};
    jobsData?.forEach((job: any) => {
      const cityName = job.cities?.name || 'Não especificado';
      cityCounts[cityName] = (cityCounts[cityName] || 0) + 1;
    });

    const jobsByCity = Object.entries(cityCounts).map(([name, count]) => ({ name, count }));

    setMetrics(prev => ({
      ...prev,
      totalJobs: totalJobs || 0,
      activeJobs,
      inactiveJobs,
      urgentJobs,
      jobsByCategory,
      jobsByCity
    }));
  };

  const loadServicesMetrics = async () => {
    const { count: totalServices } = await supabase
      .from('worker_services')
      .select('*', { count: 'exact', head: true });

    const { data: servicesData } = await supabase
      .from('worker_services')
      .select('active, category_id, price, categories(name)');

    const activeServices = servicesData?.filter(s => s.active).length || 0;

    const categoryCounts: any = {};
    const categoryPrices: any = {};
    servicesData?.forEach((service: any) => {
      const catName = service.categories?.name || 'Outros';
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;

      if (service.price) {
        if (!categoryPrices[catName]) categoryPrices[catName] = [];
        categoryPrices[catName].push(Number(service.price));
      }
    });

    const servicesByCategory = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

    const avgPriceByCategory = Object.entries(categoryPrices).map(([name, prices]: [string, any]) => ({
      name,
      avgPrice: prices.reduce((a: number, b: number) => a + b, 0) / prices.length
    }));

    setMetrics(prev => ({
      ...prev,
      totalServices: totalServices || 0,
      activeServices,
      servicesByCategory,
      avgPriceByCategory
    }));
  };

  const loadEngagementMetrics = async () => {
    const { count: totalProfileViews } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const { data: viewsData } = await supabase
      .from('profile_views')
      .select('viewed_at');

    const viewsToday = viewsData?.filter(v => new Date(v.viewed_at) >= today).length || 0;
    const viewsThisWeek = viewsData?.filter(v => new Date(v.viewed_at) >= weekAgo).length || 0;
    const viewsThisMonth = viewsData?.filter(v => new Date(v.viewed_at) >= monthAgo).length || 0;

    const { count: totalContactUnlocks } = await supabase
      .from('contact_unlocks')
      .select('*', { count: 'exact', head: true });

    const { count: totalFavorites } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true });

    const conversionRate = totalProfileViews ? ((totalContactUnlocks || 0) / totalProfileViews * 100) : 0;

    setMetrics(prev => ({
      ...prev,
      totalProfileViews: totalProfileViews || 0,
      viewsToday,
      viewsThisWeek,
      viewsThisMonth,
      totalContactUnlocks: totalContactUnlocks || 0,
      conversionRate,
      totalFavorites: totalFavorites || 0
    }));
  };

  const loadFinancialMetrics = async () => {
    const { count: totalPayments } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true });

    const { data: paymentsData } = await supabase
      .from('payments')
      .select('amount, status');

    const totalRevenue = paymentsData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const approvedPayments = paymentsData?.filter(p => p.status === 'paid').length || 0;
    const pendingPayments = paymentsData?.filter(p => p.status === 'pending').length || 0;
    const avgTicket = totalPayments ? totalRevenue / totalPayments : 0;

    const { count: destaqueOrders } = await supabase
      .from('destaque_orders')
      .select('*', { count: 'exact', head: true });

    setMetrics(prev => ({
      ...prev,
      totalPayments: totalPayments || 0,
      totalRevenue,
      destaqueOrders: destaqueOrders || 0,
      avgTicket,
      pendingPayments,
      approvedPayments
    }));
  };

  const loadRatingsMetrics = async () => {
    const { count: totalRatings } = await supabase
      .from('ratings')
      .select('*', { count: 'exact', head: true });

    const { data: ratingsData } = await supabase
      .from('ratings')
      .select('rating');

    const avgRating = ratingsData?.length
      ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length
      : 0;

    const distribution = [1, 2, 3, 4, 5].map(stars => ({
      stars,
      count: ratingsData?.filter(r => r.rating === stars).length || 0
    }));

    setMetrics(prev => ({
      ...prev,
      totalRatings: totalRatings || 0,
      avgRating,
      ratingDistribution: distribution
    }));
  };

  const loadCommunityMetrics = async () => {
    const { count: totalPosts } = await supabase
      .from('community_posts')
      .select('*', { count: 'exact', head: true });

    const { count: totalComments } = await supabase
      .from('community_comments')
      .select('*', { count: 'exact', head: true });

    const { count: totalLikes } = await supabase
      .from('community_likes')
      .select('*', { count: 'exact', head: true });

    setMetrics(prev => ({
      ...prev,
      totalPosts: totalPosts || 0,
      totalComments: totalComments || 0,
      totalLikes: totalLikes || 0
    }));
  };

  const loadRecentActivity = async () => {
    const { data: recentSignups } = await supabase
      .from('users')
      .select('name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentJobs } = await supabase
      .from('job_postings')
      .select('title, created_at, categories(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentViews } = await supabase
      .from('profile_views')
      .select('viewed_at, viewed_profile_id')
      .order('viewed_at', { ascending: false })
      .limit(5);

    const { data: recentPayments } = await supabase
      .from('payments')
      .select('amount, created_at, status')
      .order('created_at', { ascending: false })
      .limit(5);

    setRecentActivity({
      recentSignups: recentSignups || [],
      recentJobs: recentJobs || [],
      recentViews: recentViews || [],
      recentPayments: recentPayments || []
    });
  };

  const loadLeads = async () => {
    // CORREÇÃO CRÍTICA: Usar RPC seguro get_admin_users para obter dados completos de usuários
    const { data, error } = await supabase.rpc('get_admin_users');

    if (error) {
      console.error('Erro ao carregar usuários:', error);
      return;
    }

    // Mapear campos para compatibilidade com a UI existente
    const mappedData = (data || []).map((user: any) => ({
      ...user,
      nome: user.name,
      cidade: user.city,
      tipo_interesse: user.user_role === 'empregador' ? 'anunciar_servico' : 'fazer_bico'
    }));

    // Ordenar por data de criação (mais recentes primeiro)
    const sortedData = mappedData.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Descendente (mais recente primeiro)
    });

    setLeads(sortedData);
    setFilteredLeads(sortedData);
  };

  useEffect(() => {
    if (leads.length === 0) return;

    let filtered = [...leads];

    if (filterType !== 'all') {
      filtered = filtered.filter(lead => lead.tipo_interesse === filterType);
    }

    if (filterCity !== 'all') {
      filtered = filtered.filter(lead => lead.cidade === filterCity);
    }

    // Garantir que sempre mostre os mais recentes primeiro
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Descendente (mais recente primeiro)
    });

    setFilteredLeads(filtered);
  }, [filterType, filterCity, leads]);

  const exportToCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Cidade', 'Estado', 'Tipo', 'Categoria', 'Subcategoria', 'Data Cadastro', 'Último Acesso', 'Verificado', 'Premium', 'Tester', 'Créditos'];
    const rows = filteredLeads.map(user => [
      user.name || user.nome || '',
      user.email || '',
      user.phone || '',
      user.city || user.cidade || '',
      user.state || '',
      user.user_role === 'empregador' ? 'Empregador' : 'Prestador',
      user.category || '',
      user.subcategory || '',
      user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '',
      user.last_usage_at ? new Date(user.last_usage_at).toLocaleDateString('pt-BR') : '',
      user.verified ? 'Sim' : 'Não',
      user.plan_active ? 'Sim' : 'Não',
      user.is_tester ? 'Sim' : 'Não',
      user.view_credits ?? 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_bico_brasil_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('CSV de usuários exportado com sucesso');
  };

  const uniqueCities = Array.from(new Set(leads.map(lead => lead.cidade))).sort();

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
                <BarChart3 className="h-8 w-8 text-primary" />
                Dashboard Administrativo
              </h1>
              <p className="text-muted-foreground mt-2">
                Visão completa de todas as métricas e movimentações da plataforma
              </p>
            </div>
            <Button
              onClick={loadAllData}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <Activity className="h-4 w-4 mr-2" />
              {loading ? 'Atualizando...' : 'Atualizar Agora'}
            </Button>
          </div>

          {/* Filtros Temporais */}
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calendar className="h-5 w-5" />
                Filtros Temporais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={timeFilter === 'today' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setTimeFilter('today');
                      loadAllData();
                    }}
                  >
                    Hoje
                  </Button>
                  <Button
                    variant={timeFilter === 'yesterday' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setTimeFilter('yesterday');
                      loadAllData();
                    }}
                  >
                    Ontem
                  </Button>
                  <Button
                    variant={timeFilter === '7days' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setTimeFilter('7days');
                      loadAllData();
                    }}
                  >
                    7 Dias
                  </Button>
                  <Button
                    variant={timeFilter === '30days' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setTimeFilter('30days');
                      loadAllData();
                    }}
                  >
                    30 Dias
                  </Button>
                  <Button
                    variant={timeFilter === 'thisMonth' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setTimeFilter('thisMonth');
                      loadAllData();
                    }}
                  >
                    Mês Atual
                  </Button>
                  <Button
                    variant={timeFilter === 'lastMonth' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setTimeFilter('lastMonth');
                      loadAllData();
                    }}
                  >
                    Mês Anterior
                  </Button>
                  <Button
                    variant={timeFilter === 'custom' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeFilter('custom')}
                  >
                    Personalizado
                  </Button>
                </div>

                {timeFilter === 'custom' && (
                  <>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-[160px]"
                      />
                      <span className="text-sm text-muted-foreground">até</span>
                      <Input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-[160px]"
                      />
                      <Button
                        onClick={loadAllData}
                        size="sm"
                      >
                        Aplicar
                      </Button>
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ⏱️ Atualização automática a cada 60 segundos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ========== SEÇÃO 1: USUÁRIOS CADASTRADOS ========== */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <Users className="h-6 w-6" />
            Usuários Cadastrados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border border-border bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Total de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{metrics.totalLeads}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.leadsByType.fazer_bico} prestadores • {metrics.leadsByType.anunciar_servico} empregadores
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.leadsToday}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Esta Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.leadsThisWeek}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Este Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.leadsThisMonth}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela Completa de Usuários */}
          <Card className="border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Tabela de Usuários (Visão Completa)</CardTitle>
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4 flex-wrap">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="fazer_bico">Prestador</SelectItem>
                    <SelectItem value="anunciar_servico">Empregador</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterCity} onValueChange={setFilterCity}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrar por cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as cidades</SelectItem>
                    {uniqueCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="text-sm text-muted-foreground flex items-center">
                  Mostrando {filteredLeads.length} de {leads.length} usuários
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="whitespace-nowrap text-xs">ID</TableHead>
                      <TableHead className="whitespace-nowrap">Nome</TableHead>
                      <TableHead className="whitespace-nowrap">Email</TableHead>
                      <TableHead className="whitespace-nowrap">Telefone</TableHead>
                      <TableHead className="whitespace-nowrap">Cidade/Estado</TableHead>
                      <TableHead className="whitespace-nowrap">Bairro</TableHead>
                      <TableHead className="whitespace-nowrap">Tipo</TableHead>
                      <TableHead className="whitespace-nowrap">Categoria</TableHead>
                      <TableHead className="whitespace-nowrap">Criado em</TableHead>
                      <TableHead className="whitespace-nowrap">Último Acesso</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Créditos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.slice(0, 50).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                          {user.id?.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{user.name || user.nome}</TableCell>
                        <TableCell className="whitespace-nowrap">{user.email || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{user.phone || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {user.city || user.cidade || '-'}{user.state ? `, ${user.state}` : ''}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {user.neighborhood || '-'}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${user.user_role === 'empregador' || user.tipo_interesse === 'anunciar_servico'
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300'
                            : 'bg-green-500/20 text-green-600 dark:text-green-300'
                            }`}>
                            {user.user_role === 'empregador' ? 'Empregador' : 'Prestador'}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs">
                          {user.category || '-'}
                          {user.subcategory && <span className="text-muted-foreground"> / {user.subcategory}</span>}
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {user.last_usage_at ? new Date(user.last_usage_at).toLocaleDateString('pt-BR') : 'Nunca'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {user.verified && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-600">Verificado</span>
                            )}
                            {user.plan_active && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-600">Premium</span>
                            )}
                            {user.is_tester && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-600">Tester</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          {user.view_credits ?? 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredLeads.length > 50 && (
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  Mostrando os primeiros 50 usuários. Use os filtros para refinar a busca.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* ========== SEÇÃO 2: MÉTRICAS DE USUÁRIOS ========== */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <UserCheck className="h-6 w-6" />
            Usuários
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalUsers}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Ativos (7 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeUsers7Days}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Prestadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.prestadores}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Empregadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.empregadores}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Verificados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.verifiedUsers}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Assinaturas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeSubscriptions}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Testadores Beta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.betaTesters}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Novos Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.newUsersToday}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Esta Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.newUsersThisWeek}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Este Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.newUsersThisMonth}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* ========== SEÇÃO 3: ANÚNCIOS (JOBS) ========== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <Briefcase className="h-6 w-6" />
              Anúncios (Jobs)
            </h2>
            <Button onClick={() => navigate('/admin/jobs')} variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow border border-border" onClick={() => navigate('/admin/jobs')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalJobs}</div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow border border-border" onClick={() => navigate('/admin/jobs?status=published')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.activeJobs}</div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow border border-border" onClick={() => navigate('/admin/jobs?status=inactive')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Inativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">{metrics.inactiveJobs}</div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow border border-border" onClick={() => navigate('/admin/jobs?urgent=true')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Urgentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{metrics.urgentJobs}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* ========== SEÇÃO 4: SERVIÇOS ========== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <TrendingUp className="h-6 w-6" />
              Serviços Oferecidos
            </h2>
            <Button onClick={() => navigate('/admin/services')} variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow border border-border" onClick={() => navigate('/admin/services')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Total de Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalServices}</div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow border border-border" onClick={() => navigate('/admin/services?status=active')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Serviços Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.activeServices}</div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow border border-border" onClick={() => navigate('/admin/services')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Categorias Diferentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.servicesByCategory.length}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* ========== SEÇÃO 5: ENGAJAMENTO ========== */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <Eye className="h-6 w-6" />
            Engajamento
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Total de Visualizações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalProfileViews}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.viewsToday}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Esta Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.viewsThisWeek}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Este Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.viewsThisMonth}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Contatos Desbloqueados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalContactUnlocks}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Taxa: {metrics.conversionRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Favoritos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalFavorites}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* ========== SEÇÃO 6: FINANCEIRO ========== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <DollarSign className="h-6 w-6" />
              Financeiro
            </h2>
            <Button onClick={() => navigate('/admin/payments')} variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow border border-border" onClick={() => navigate('/admin/payments')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Total de Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalPayments}</div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow border border-border" onClick={() => navigate('/admin/payments')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Receita Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {metrics.totalRevenue.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow border border-border" onClick={() => navigate('/admin/payments')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Ticket Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {metrics.avgTicket.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow border border-border" onClick={() => navigate('/admin/payments?status=paid')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Aprovados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.approvedPayments}</div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow border border-border" onClick={() => navigate('/admin/payments?status=pending')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{metrics.pendingPayments}</div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow border border-border" onClick={() => navigate('/admin/payments')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Pedidos Destaque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.destaqueOrders}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* ========== SEÇÃO 7: AVALIAÇÕES ========== */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <Star className="h-6 w-6" />
            Avaliações
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Total de Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalRatings}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Média Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 flex items-center gap-1">
                  {metrics.avgRating.toFixed(1)}
                  <Star className="h-5 w-5 fill-current" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Distribuição</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-xs">
                  {metrics.ratingDistribution.map(({ stars, count }) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="w-12">{stars} ⭐</span>
                      <div className="flex-grow bg-muted h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500"
                          style={{ width: `${metrics.totalRatings ? (count / metrics.totalRatings * 100) : 0}%` }}
                        />
                      </div>
                      <span className="w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* ========== SEÇÃO 8: COMUNIDADE ========== */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <MessageSquare className="h-6 w-6" />
            Comunidade
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalPosts}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Comentários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalComments}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Curtidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-1">
                  <Heart className="h-5 w-5 text-red-500 fill-current" />
                  {metrics.totalLikes}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* ========== SEÇÃO 9: ATIVIDADE EM TEMPO REAL ========== */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <Activity className="h-6 w-6" />
            Atividade Recente
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Últimos Cadastros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentActivity.recentSignups.map((signup, i) => (
                    <div key={i} className="text-sm flex items-center justify-between">
                      <span className="font-medium">{signup.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(signup.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Últimos Anúncios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentActivity.recentJobs.map((job, i) => (
                    <div key={i} className="text-sm flex items-center justify-between">
                      <span className="font-medium">{job.title}</span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(job.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Últimas Visualizações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentActivity.recentViews.map((view, i) => (
                    <div key={i} className="text-sm flex items-center justify-between">
                      <span className="text-muted-foreground">Perfil visualizado</span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(view.viewed_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Últimos Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentActivity.recentPayments.map((payment, i) => (
                    <div key={i} className="text-sm flex items-center justify-between">
                      <span className="font-medium">R$ {payment.amount.toFixed(2)}</span>
                      <span className={`text-xs ${payment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* ========== SEÇÃO 10: GRÁFICOS ========== */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Gráficos e Tendências</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Cadastros por Dia (Últimos 30 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.signupsByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Anúncios por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.jobsByCategory.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Usuários por Cidade</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.leadsByCity.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {metrics.leadsByCity.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Serviços por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.servicesByCategory.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
