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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');

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
    signupsByDay: [] as any[],
    jobsByCategory: [] as any[],
    servicesByCategory: [] as any[]
  });

  const [leads, setLeads] = useState<any[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);

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
    const { data: paymentsData } = await supabase.from('payments').select('amount').eq('status', 'paid');

    if (!usersData) return;

    const { startDate, endDate } = getDateRange();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredUsers = usersData.filter(u => {
      const d = new Date(u.created_at);
      return d >= startDate && d <= endDate;
    });

    const totalLeads = usersData.length;
    const leadsToday = usersData.filter(u => new Date(u.created_at) >= today).length;
    const totalRevenue = paymentsData?.reduce((acc, p) => acc + (p.amount || 0), 0) || 0;

    const cityCounts: any = {};
    usersData.forEach(u => {
      const city = u.city || 'Outros';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    setMetrics(prev => ({
      ...prev,
      totalLeads,
      leadsToday,
      totalRevenue,
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
    const { data, error } = await supabase.rpc('get_admin_users');
    if (error) {
      toast.error('Erro ao buscar usuários');
      return;
    }
    const sorted = (data || []).sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setLeads(sorted);
    setFilteredLeads(sorted);
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Carregando painel...</p>
        </div>
      </div>
    );
  }

  const uniqueCities = Array.from(new Set(leads.map(l => l.city || 'Outros'))).sort();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
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
            <Button onClick={loadAllData} variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest bg-slate-900 border-slate-800 hover:bg-slate-800">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white leading-none">{metrics.totalLeads}</div>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-blue-500/10 text-blue-400 border-0 text-[10px] h-5">{metrics.leadsByType.fazer_bico} P</Badge>
                <Badge className="bg-amber-500/10 text-amber-400 border-0 text-[10px] h-5">{metrics.leadsByType.anunciar_servico} E</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Receita Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-emerald-400 leading-none">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.totalRevenue)}
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Pagamentos confirmados</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Atividade Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white leading-none">+{metrics.leadsToday}</div>
              <p className="text-[10px] text-slate-500 mt-2">Novos registros em 24h</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Eco-Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div>
                  <div className="text-xl font-black text-white">{metrics.totalJobs}</div>
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Vagas</div>
                </div>
                <div>
                  <div className="text-xl font-black text-white">{metrics.totalServices}</div>
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Serviços</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* GESTÃO DE USUÁRIOS */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="BUSCAR POR NOME, EMAIL OU CPF..."
                className="pl-10 admin-filter-input bg-slate-900 border-slate-800 text-xs font-bold uppercase tracking-wider"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="admin-filter-select bg-slate-900 border-slate-800 text-[10px] font-black uppercase">
                  <SelectValue placeholder="TIPO" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  <SelectItem value="all">TODOS TIPOS</SelectItem>
                  <SelectItem value="prestador">PRESTADORES</SelectItem>
                  <SelectItem value="empregador">EMPREGADORES</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCity} onValueChange={setFilterCity}>
                <SelectTrigger className="admin-filter-select bg-slate-900 border-slate-800 text-[10px] font-black uppercase">
                  <SelectValue placeholder="CIDADE" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  <SelectItem value="all">TODAS CIDADES</SelectItem>
                  {uniqueCities.map(city => (
                    <SelectItem key={city} value={city}>{city.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="bg-slate-950 border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <Table className="admin-table">
                <TableHeader className="bg-slate-900/50">
                  <TableRow className="border-slate-800 h-10 hover:bg-transparent">
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
                      className="border-slate-900 hover:bg-slate-900/40 cursor-pointer transition-colors group"
                      onClick={() => navigate(`/worker/${user.id}`)}
                    >
                      <TableCell className="py-2 px-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-white group-hover:text-primary transition-colors">{user.name?.toUpperCase() || '-'}</span>
                          <span className="text-[9px] text-slate-500 font-bold">{user.phone || 'Sem Telefone'}</span>
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

      <Footer />
    </div>
  );
}
