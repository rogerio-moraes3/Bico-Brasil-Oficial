import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Briefcase,
  TrendingUp,
  Download,
  Eye,
  DollarSign,
  Star,
  MessageSquare,
  Activity,
  Heart,
  ChevronRight,
  UserCheck,
  Crown,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Calendar,
  Lock,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // ADMIN EMAIL WHITELIST (SECURITY CRITICAL)
  useEffect(() => {
    const allowed = ['23rogeriomoraes@gmail.com', 'nando_petro@hotmail.com'];
    if (!user) return; // ProtectedRoute handles redirect to login if not authenticated
    const email = (user.email || '').toLowerCase();
    if (!allowed.includes(email)) {
      // Immediate block and inform user
      alert('Acesso Negado');
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Filtros
  const [timeFilter, setTimeFilter] = useState<'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'lastMonth' | 'custom'>('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    leadsByType: { fazer_bico: 0, anunciar_servico: 0 },
    leadsByCity: [] as any[],
    leadsToday: 0,
    leadsThisWeek: 0,
    leadsThisMonth: 0,
    leadsLastMonth: 0,
    totalUsers: 0,
    activeUsers7Days: 0,
    prestadores: 0,
    empregadores: 0,
    verifiedUsers: 0,
    activeSubscriptions: 0,
    newUsersToday: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalServices: 0,
    totalProfileViews: 0,
    totalContactUnlocks: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    approvedPayments: 0,
    totalPayments: 0,
    conversionRate: 0,
    growthRate: 0,
    signupsByDay: [] as any[],
    revenueTrend: [] as any[],
    jobsByCategory: [] as any[],
    servicesByCategory: [] as any[]
  });

  const [leads, setLeads] = useState<any[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);

  // Modal states for clickable cards
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [conversionModalOpen, setConversionModalOpen] = useState(false);

  // Detailed data for modals
  const [paymentDetails, setPaymentDetails] = useState<any[]>([]);
  const [annualRevenue, setAnnualRevenue] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(() => {
      loadAllData();
    }, 60000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        navigate('/intro');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      const { data: colaboradorData } = await supabase
        .from('colaboradores_autorizados')
        .select('email')
        .ilike('email', user.email || '')
        .maybeSingle();

      if (!roleData && !colaboradorData) {
        toast.error('Acesso não autorizado');
        navigate('/intro');
        return;
      }

      setUserEmail(user.email || '');
      setIsAdmin(true);
      loadAllData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/intro');
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadGeneralMetrics(),
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
      case 'today': startDate = today; break;
      case 'yesterday':
        startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        endDate = new Date(today.getTime() - 1);
        break;
      case '7days': startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30days': startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case 'thisMonth': startDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'custom':
        startDate = customStartDate ? new Date(customStartDate) : new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = customEndDate ? new Date(customEndDate) : new Date();
        break;
      default: startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return { startDate, endDate };
  };

  const loadGeneralMetrics = async () => {
    const { data: usersData } = await supabase.from('users').select('*');
    const { count: totalJobs } = await supabase.from('job_postings').select('*', { count: 'exact', head: true });
    const { count: totalServices } = await supabase.from('worker_services').select('*', { count: 'exact', head: true });
    const { data: allPayments } = await supabase.from('payments').select('amount, status, created_at, user_id');

    if (!usersData) return;

    const { startDate, endDate } = getDateRange();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // User metrics
    const totalLeads = usersData.length;
    const leadsToday = usersData.filter(u => new Date(u.created_at) >= today).length;
    const leadsThisMonth = usersData.filter(u => new Date(u.created_at) >= thisMonthStart).length;
    const leadsLastMonth = usersData.filter(u => {
      const d = new Date(u.created_at);
      return d >= lastMonthStart && d <= lastMonthEnd;
    }).length;

    // Payment metrics
    const approvedPayments = allPayments?.filter(p => p.status === 'paid') || [];
    const pendingPayments = allPayments?.filter(p => p.status === 'pending') || [];
    const totalRevenue = approvedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const pendingRevenue = pendingPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

    // Conversion rate: users with payments / total users
    const paidUserIds = new Set(approvedPayments.map(p => p.user_id).filter(Boolean));
    const conversionRate = totalLeads > 0 ? (paidUserIds.size / totalLeads) * 100 : 0;

    // Growth rate: (this month - last month) / last month * 100
    const growthRate = leadsLastMonth > 0 ? ((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100 : 0;

    // Revenue trend (last 30 days)
    const revenueTrend: any[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayRevenue = approvedPayments
        .filter(p => p.created_at?.startsWith(dateStr))
        .reduce((acc, p) => acc + (p.amount || 0), 0);
      revenueTrend.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        revenue: dayRevenue
      });
    }

    // City distribution
    const cityCounts: any = {};
    usersData.forEach(u => {
      const city = u.city || 'Outros';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    // Annual revenue calculation
    const currentYear = new Date().getFullYear();
    const annualRevenueData = [];

    for (let year = 2024; year <= currentYear + 1; year++) {
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59);

      if (year <= currentYear) {
        // Historical data
        const yearRevenue = approvedPayments
          .filter(p => {
            const pDate = new Date(p.created_at);
            return pDate >= yearStart && pDate <= yearEnd;
          })
          .reduce((acc, p) => acc + (p.amount || 0), 0);

        annualRevenueData.push({
          year,
          revenue: yearRevenue,
          isProjection: false
        });
      } else {
        // Projection for next year
        const avgMonthlyRevenue = totalRevenue / Math.max(1, new Date().getMonth() + 1);
        const projection = avgMonthlyRevenue * 12 * 1.3; // 30% growth estimate

        annualRevenueData.push({
          year,
          revenue: projection,
          isProjection: true
        });
      }
    }

    setAnnualRevenue(annualRevenueData);

    // Store detailed payment data for modal
    const detailedPayments = await supabase
      .from('payments')
      .select(`
        *,
        users:user_id (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (detailedPayments.data) {
      setPaymentDetails(detailedPayments.data);
    }

    setMetrics(prev => ({
      ...prev,
      totalLeads,
      leadsToday,
      leadsThisMonth,
      leadsLastMonth,
      totalRevenue,
      pendingRevenue,
      approvedPayments: approvedPayments.length,
      totalPayments: allPayments?.length || 0,
      conversionRate,
      growthRate,
      revenueTrend,
      leadsByType: {
        fazer_bico: usersData.filter(u => u.user_role === 'prestador').length,
        anunciar_servico: usersData.filter(u => u.user_role === 'empregador').length
      },
      leadsByCity: Object.entries(cityCounts).map(([name, value]) => ({ name, value })),
      totalJobs: totalJobs || 0,
      totalServices: totalServices || 0
    }));
  };

  const loadRecentActivity = async () => {
    // Implementar se necessário gráficos de linha
  };

  const loadLeads = async () => {
    const { data, error } = await supabase
      .from('admin_user_list')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao buscar usuários');
      return;
    }

    setLeads(data || []);
    setFilteredLeads(data || []);
  };

  useEffect(() => {
    let filtered = leads.filter(lead => {
      const matchType = filterType === 'all' || lead.user_role === filterType;
      const matchCity = filterCity === 'all' || lead.city === filterCity;
      const matchSearch = !searchTerm ||
        (lead.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.cpf?.includes(searchTerm));
      return matchType && matchCity && matchSearch;
    });
    setFilteredLeads(filtered);
  }, [filterType, filterCity, searchTerm, leads]);

  const exportToCSV = () => {
    const headers = ['Nome', 'Email', 'CPF', 'Cidade', 'Tipo', 'Cadastro'];
    const rows = filteredLeads.map(u => [
      u.name || '-',
      u.email || '-',
      u.cpf || '-',
      u.city || '-',
      u.user_role === 'empregador' ? 'Empregador' : 'Prestador',
      new Date(u.created_at).toLocaleDateString()
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bico_brasil_users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center dark:bg-slate-950 dark:text-slate-200">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Carregando painel...</p>
        </div>
      </div>
    );
  }

  const uniqueCities = Array.from(new Set(leads.map(l => l.city || 'Outros'))).sort();

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-slate-950 dark:text-slate-200">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-3 text-white uppercase tracking-tighter">
              <ShieldCheck className="h-7 w-7 text-primary" />
              Central de Comando
            </h1>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Bem-vindo, {userEmail}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadAllData} variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest bg-card border-border hover:bg-gray-100 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800">
              <Activity className="h-3.5 w-3.5 mr-1.5" />
              Sincronizar
            </Button>
            <Button onClick={exportToCSV} variant="default" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Exportar
            </Button>
          </div>
        </header>

        {/* METRICAS RAPIDAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card
            className="bg-card border-border shadow-xl cursor-pointer hover:border-primary/50 transition-all dark:bg-slate-900 dark:border-slate-800"
            onClick={() => setUsersModalOpen(true)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                Total Usuários
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white leading-none">{metrics.totalLeads}</div>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-blue-500/10 text-blue-400 border-0 text-[10px] h-5">{metrics.leadsByType.fazer_bico} P</Badge>
                <Badge className="bg-amber-500/10 text-amber-400 border-0 text-[10px] h-5">{metrics.leadsByType.anunciar_servico} E</Badge>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-card border-border shadow-xl cursor-pointer hover:border-emerald-500/50 transition-all dark:bg-slate-900 dark:border-slate-800"
            onClick={() => setRevenueModalOpen(true)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                Receita Total
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-emerald-400 leading-none">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.totalRevenue)}
              </div>
              <p className="text-[10px] text-slate-500 mt-2">{metrics.approvedPayments} pagamentos</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-xl dark:bg-slate-900 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-amber-400 leading-none">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.pendingRevenue)}
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Aguardando confirmação</p>
            </CardContent>
          </Card>

          <Card
            className="bg-card border-border shadow-xl cursor-pointer hover:border-primary/50 transition-all dark:bg-slate-900 dark:border-slate-800"
            onClick={() => setConversionModalOpen(true)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                Conversão
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-primary leading-none">{metrics.conversionRate.toFixed(1)}%</div>
              <p className="text-[10px] text-slate-500 mt-2">Usuários que pagaram</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-xl dark:bg-slate-900 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Crescimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-black leading-none ${metrics.growthRate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {metrics.growthRate >= 0 ? '+' : ''}{metrics.growthRate.toFixed(1)}%
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">vs mês anterior</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-xl dark:bg-slate-900 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Atividade Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-primary leading-none">+{metrics.leadsToday}</div>
              <p className="text-[10px] text-muted-foreground mt-2">Novos registros em 24h</p>
            </CardContent>
          </Card>
        </div>

        {/* GRAFICO DE TENDENCIA DE RECEITA */}
        <Card className="bg-card border-border shadow-xl mb-8 dark:bg-slate-900 dark:border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Tendência de Receita (Últimos 30 Dias)
            </CardTitle>
            <CardDescription className="text-[10px] text-slate-500">
              Receita diária de pagamentos aprovados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={metrics.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                  formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* TABELA DE RECEITA ANUAL */}
        <Card className="bg-card border-border shadow-xl mb-8 dark:bg-slate-900 dark:border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              Receita Anual
            </CardTitle>
            <CardDescription className="text-[10px] text-slate-500">
              Histórico e projeção de receita por ano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-card/50 dark:bg-slate-900/50">
                <TableRow className="border-border hover:bg-transparent dark:border-slate-800">
                  <TableHead className="text-[10px] font-black text-slate-500 uppercase">Ano</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-500 uppercase text-right">Receita</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-500 uppercase text-right">Crescimento</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-500 uppercase text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {annualRevenue.map((yearData, index) => {
                  const prevYear = index > 0 ? annualRevenue[index - 1] : null;
                  const growth = prevYear && prevYear.revenue > 0
                    ? ((yearData.revenue - prevYear.revenue) / prevYear.revenue) * 100
                    : 0;

                  return (
                    <TableRow key={yearData.year} className="border-border hover:bg-card/40 dark:border-slate-800">
                      <TableCell className="font-black text-white text-sm">{yearData.year}</TableCell>
                      <TableCell className="text-right">
                        <span className={`text-sm font-black ${yearData.isProjection ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(yearData.revenue)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {index > 0 && (
                          <span className={`text-xs font-bold ${growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`text-[8px] font-black ${yearData.isProjection ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'} border-0`}>
                          {yearData.isProjection ? 'PROJEÇÃO' : 'REALIZADO'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* GESTÃO DE USUÁRIOS */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="BUSCAR POR NOME, EMAIL OU CPF..."
                className="pl-10 admin-filter-input bg-card border-border text-xs font-bold uppercase tracking-wider dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="admin-filter-select bg-card border-border text-[10px] font-black uppercase dark:bg-slate-900 dark:border-slate-800 dark:text-white">
                  <SelectValue placeholder="TIPO" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border dark:bg-slate-900 dark:border-slate-800 dark:text-white">
                  <SelectItem value="all">TODOS TIPOS</SelectItem>
                  <SelectItem value="prestador">PRESTADORES</SelectItem>
                  <SelectItem value="empregador">EMPREGADORES</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCity} onValueChange={setFilterCity}>
                <SelectTrigger className="admin-filter-select bg-card border-border text-[10px] font-black uppercase dark:bg-slate-900 dark:border-slate-800 dark:text-white">
                  <SelectValue placeholder="CIDADE" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border dark:bg-slate-900 dark:border-slate-800 dark:text-white">
                  <SelectItem value="all">TODAS CIDADES</SelectItem>
                  {uniqueCities.map(city => (
                    <SelectItem key={city} value={city}>{city.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="bg-card border-border overflow-hidden shadow-2xl dark:bg-slate-950 dark:border-slate-800">
            <div className="overflow-x-auto">
              <Table className="admin-table">
                <TableHeader className="bg-card/50 dark:bg-slate-900/50">
                  <TableRow className="border-border h-10 hover:bg-transparent dark:border-slate-800">
                    <TableHead className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-4">Nome Completo</TableHead>
                    <TableHead className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-4">Email</TableHead>
                    <TableHead className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-4">CPF / ID</TableHead>
                    <TableHead className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-4">Cidade</TableHead>
                    <TableHead className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-4">Tipo</TableHead>
                    <TableHead className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-4">Status</TableHead>
                    <TableHead className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-4 text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-border hover:bg-card/40 cursor-pointer transition-colors group dark:border-slate-800 dark:hover:bg-slate-900/40"
                      onClick={() => navigate(`/worker/${user.id}`)}
                    >
                      <TableCell className="py-2 px-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-foreground dark:text-white group-hover:text-primary transition-colors">{user.name?.toUpperCase() || '-'}</span>
                          <span className="text-[9px] text-muted-foreground font-bold">{user.phone || 'Sem Telefone'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-4 text-[10px] text-slate-400 font-medium">{user.email}</TableCell>
                      <TableCell className="py-2 px-4 text-[10px] font-mono text-slate-500">{user.cpf || user.id.slice(0, 8)}</TableCell>
                      <TableCell className="py-2 px-4">
                        <span className="text-[10px] font-black text-slate-300 bg-slate-800/50 px-2 py-0.5 rounded">{user.city?.toUpperCase() || '-'}</span>
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <span className={cn(
                          "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm",
                          user.user_role === 'empregador' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                        )}>
                          {user.user_role === 'empregador' ? 'EMPREGADOR' : 'PRESTADOR'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <div className="flex gap-1">
                          {user.verified && <div title="Verificado" className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                          {user.plan_active && <div title="Premium" className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
                          {!user.verified && !user.plan_active && <div className="w-2 h-2 rounded-full bg-slate-800" />}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-4 text-right text-[10px] text-slate-500 font-bold whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredLeads.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-xs text-slate-500 font-black uppercase tracking-widest">
                        Nenhum registro encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="bg-slate-900/50 px-4 py-3 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Exibindo {filteredLeads.length} usuários de {leads.length}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Dados Sincronizados</span>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* MODAL: RECEITA DETALHADA */}
      <Dialog open={revenueModalOpen} onOpenChange={setRevenueModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-950 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              Receita Detalhada
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Análise completa de pagamentos e transações
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="approved" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-900">
              <TabsTrigger value="approved" className="text-xs font-bold">Aprovados</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs font-bold">Pendentes</TabsTrigger>
              <TabsTrigger value="all" className="text-xs font-bold">Todos</TabsTrigger>
            </TabsList>

            <TabsContent value="approved" className="mt-4">
              <div className="rounded-lg border border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-900/50">
                    <TableRow className="border-slate-800">
                      <TableHead className="text-[9px] font-black text-slate-500">Data</TableHead>
                      <TableHead className="text-[9px] font-black text-slate-500">Usuário</TableHead>
                      <TableHead className="text-[9px] font-black text-slate-500">Valor</TableHead>
                      <TableHead className="text-[9px] font-black text-slate-500">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentDetails.filter(p => p.status === 'paid').slice(0, 10).map((payment) => (
                      <TableRow key={payment.id} className="border-slate-800 hover:bg-slate-900/40">
                        <TableCell className="text-[10px] text-slate-400">
                          {new Date(payment.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-[10px] text-white font-bold">
                          {payment.users?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-[11px] font-black text-emerald-400">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black border-0">
                            PAGO
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <div className="rounded-lg border border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-900/50">
                    <TableRow className="border-slate-800">
                      <TableHead className="text-[9px] font-black text-slate-500">Data</TableHead>
                      <TableHead className="text-[9px] font-black text-slate-500">Usuário</TableHead>
                      <TableHead className="text-[9px] font-black text-slate-500">Valor</TableHead>
                      <TableHead className="text-[9px] font-black text-slate-500">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentDetails.filter(p => p.status === 'pending').slice(0, 10).map((payment) => (
                      <TableRow key={payment.id} className="border-slate-800 hover:bg-slate-900/40">
                        <TableCell className="text-[10px] text-slate-400">
                          {new Date(payment.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-[10px] text-white font-bold">
                          {payment.users?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-[11px] font-black text-amber-400">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-amber-500/10 text-amber-500 text-[8px] font-black border-0">
                            PENDENTE
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="all" className="mt-4">
              <div className="rounded-lg border border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-900/50">
                    <TableRow className="border-slate-800">
                      <TableHead className="text-[9px] font-black text-slate-500">Data</TableHead>
                      <TableHead className="text-[9px] font-black text-slate-500">Usuário</TableHead>
                      <TableHead className="text-[9px] font-black text-slate-500">Valor</TableHead>
                      <TableHead className="text-[9px] font-black text-slate-500">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentDetails.slice(0, 15).map((payment) => (
                      <TableRow key={payment.id} className="border-slate-800 hover:bg-slate-900/40">
                        <TableCell className="text-[10px] text-slate-400">
                          {new Date(payment.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-[10px] text-white font-bold">
                          {payment.users?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-[11px] font-black text-primary">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[8px] font-black border-0 ${payment.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' :
                            payment.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                              'bg-red-500/10 text-red-500'
                            }`}>
                            {payment.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* MODAL: SEGMENTAÇÃO DE USUÁRIOS */}
      <Dialog open={usersModalOpen} onOpenChange={setUsersModalOpen}>
        <DialogContent className="max-w-3xl bg-slate-950 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Segmentação de Usuários
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Análise detalhada por tipo e localização
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-black text-white mb-4">Por Tipo</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Prestadores', value: metrics.leadsByType.fazer_bico },
                      { name: 'Contratantes', value: metrics.leadsByType.anunciar_servico }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-sm font-black text-white mb-4">Top 5 Cidades</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={metrics.leadsByCity.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: FUNIL DE CONVERSÃO */}
      <Dialog open={conversionModalOpen} onOpenChange={setConversionModalOpen}>
        <DialogContent className="max-w-2xl bg-slate-950 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Funil de Conversão
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Jornada do usuário até o pagamento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black text-white">Total Registros</span>
                <span className="text-2xl font-black text-primary">{metrics.totalLeads}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full">
                <div className="bg-primary h-2 rounded-full w-full" />
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black text-white">Usuários Ativos</span>
                <span className="text-2xl font-black text-blue-400">{Math.floor(metrics.totalLeads * 0.7)}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full">
                <div className="bg-blue-400 h-2 rounded-full w-[70%]" />
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black text-white">Pagamentos Realizados</span>
                <span className="text-2xl font-black text-emerald-400">{metrics.approvedPayments}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full">
                <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${metrics.conversionRate}%` }} />
              </div>
            </div>

            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-2">{metrics.conversionRate.toFixed(1)}%</div>
                <div className="text-xs font-bold text-slate-400 uppercase">Taxa de Conversão</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
