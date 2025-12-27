import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Eye, Download, Search, Filter, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { toast } from 'sonner';
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['hsl(var(--primary))', 'hsl(142 76% 36%)', 'hsl(48 96% 53%)', 'hsl(25 95% 53%)', 'hsl(262 83% 58%)'];

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  gateway: string | null;
  plan_type: string | null;
  created_at: string;
  subscription_start: string | null;
  subscription_end: string | null;
  mercadopago_payment_id: string | null;
  user?: {
    name: string;
    email: string | null;
    phone: string;
  };
}

export default function AdminPayments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('30days');

  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    approvedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    avgTicket: 0,
    revenueThisMonth: 0,
    revenueLastMonth: 0,
    growthRate: 0
  });

  // Chart data
  const [revenueByDay, setRevenueByDay] = useState<any[]>([]);
  const [paymentsByStatus, setPaymentsByStatus] = useState<any[]>([]);
  const [paymentsByPlan, setPaymentsByPlan] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, searchTerm, statusFilter, planFilter, dateFilter]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        navigate('/admin');
        return;
      }

      // Verificação via user_roles (server-side RLS)
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      // Fallback via colaboradores_autorizados (case-insensitive)
      const { data: colaboradorData } = await supabase
        .from('colaboradores_autorizados')
        .select('email')
        .ilike('email', user.email || '')
        .maybeSingle();

      if (!roleData && !colaboradorData) {
        toast.error('Acesso não autorizado');
        navigate('/admin');
        return;
      }

      loadPayments();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/admin');
    }
  };

  const loadPayments = async () => {
    setLoading(true);
    try {
      const { data: paymentsData, error } = await supabase
        .from('payments')
        .select(`
          *,
          user:users!user_id(name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPayments(paymentsData || []);
      calculateStats(paymentsData || []);
      calculateChartData(paymentsData || []);

    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Payment[]) => {
    const approved = data.filter(p => p.status === 'paid');
    const pending = data.filter(p => p.status === 'pending');
    const failed = data.filter(p => p.status === 'failed');
    
    const totalRevenue = approved.reduce((sum, p) => sum + p.amount, 0);
    const avgTicket = approved.length > 0 ? totalRevenue / approved.length : 0;

    // This month revenue
    const thisMonthStart = startOfMonth(new Date());
    const thisMonthEnd = endOfMonth(new Date());
    const revenueThisMonth = approved
      .filter(p => {
        const date = new Date(p.created_at);
        return date >= thisMonthStart && date <= thisMonthEnd;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    // Last month revenue
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
    const revenueLastMonth = approved
      .filter(p => {
        const date = new Date(p.created_at);
        return date >= lastMonthStart && date <= lastMonthEnd;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const growthRate = revenueLastMonth > 0 
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 
      : 0;

    setStats({
      totalRevenue,
      totalPayments: data.length,
      approvedPayments: approved.length,
      pendingPayments: pending.length,
      failedPayments: failed.length,
      avgTicket,
      revenueThisMonth,
      revenueLastMonth,
      growthRate
    });
  };

  const calculateChartData = (data: Payment[]) => {
    // Revenue by day (last 30 days)
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    });

    const revenueData = last30Days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const dayRevenue = data
        .filter(p => {
          const date = new Date(p.created_at);
          return p.status === 'paid' && date >= dayStart && date <= dayEnd;
        })
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        date: format(day, 'dd/MM', { locale: ptBR }),
        receita: dayRevenue
      };
    });
    setRevenueByDay(revenueData);

    // Payments by status
    const statusData = [
      { name: 'Aprovados', value: data.filter(p => p.status === 'paid').length, color: '#00C49F' },
      { name: 'Pendentes', value: data.filter(p => p.status === 'pending').length, color: '#FFBB28' },
      { name: 'Falhados', value: data.filter(p => p.status === 'failed').length, color: '#FF8042' },
      { name: 'Em Processo', value: data.filter(p => p.status === 'in_process').length, color: '#0088FE' }
    ].filter(item => item.value > 0);
    setPaymentsByStatus(statusData);

    // Payments by plan
    const planData = [
      { name: 'Básico', value: data.filter(p => p.plan_type === 'basico' && p.status === 'paid').length },
      { name: 'VIP', value: data.filter(p => p.plan_type === 'vip' && p.status === 'paid').length },
      { name: 'Outros', value: data.filter(p => !p.plan_type && p.status === 'paid').length }
    ].filter(item => item.value > 0);
    setPaymentsByPlan(planData);
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Date filter
    const now = new Date();
    if (dateFilter === '7days') {
      filtered = filtered.filter(p => new Date(p.created_at) >= subDays(now, 7));
    } else if (dateFilter === '30days') {
      filtered = filtered.filter(p => new Date(p.created_at) >= subDays(now, 30));
    } else if (dateFilter === 'thisMonth') {
      filtered = filtered.filter(p => new Date(p.created_at) >= startOfMonth(now));
    } else if (dateFilter === 'lastMonth') {
      const lastMonth = subMonths(now, 1);
      filtered = filtered.filter(p => {
        const date = new Date(p.created_at);
        return date >= startOfMonth(lastMonth) && date <= endOfMonth(lastMonth);
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.user?.name?.toLowerCase().includes(term) ||
        p.user?.email?.toLowerCase().includes(term) ||
        p.mercadopago_payment_id?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (planFilter !== 'all') {
      filtered = filtered.filter(p => p.plan_type === planFilter);
    }

    setFilteredPayments(filtered);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Usuário', 'Email', 'Valor', 'Plano', 'Status', 'Gateway', 'Data', 'ID MercadoPago'];
    const rows = filteredPayments.map(p => [
      p.id,
      p.user?.name || '',
      p.user?.email || '',
      p.amount,
      p.plan_type || '',
      p.status,
      p.gateway || '',
      format(new Date(p.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      p.mercadopago_payment_id || ''
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pagamentos_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Aprovado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Falhado</Badge>;
      case 'in_process':
        return <Badge className="bg-blue-500">Em Processo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case 'basico':
        return <Badge variant="outline">Básico</Badge>;
      case 'vip':
        return <Badge className="bg-purple-500">VIP</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Gerenciar Pagamentos</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Este Mês</p>
                  <p className="text-xl font-bold">R$ {stats.revenueThisMonth.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Aprovados</p>
                  <p className="text-xl font-bold">{stats.approvedPayments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-xl font-bold">{stats.pendingPayments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Falhados</p>
                  <p className="text-xl font-bold">{stats.failedPayments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Médio</p>
                  <p className="text-xl font-bold">R$ {stats.avgTicket.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Receita Diária (Últimos 30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
                  <Bar dataKey="receita" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pagamentos por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo Período</SelectItem>
                  <SelectItem value="7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="thisMonth">Este Mês</SelectItem>
                  <SelectItem value="lastMonth">Mês Passado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="paid">Aprovado</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="failed">Falhado</SelectItem>
                  <SelectItem value="in_process">Em Processo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Planos</SelectItem>
                  <SelectItem value="basico">Básico</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={exportToCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>

              <Button onClick={loadPayments} variant="outline">
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Transações ({filteredPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">
                        {payment.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.user?.name || '-'}</p>
                          <p className="text-sm text-muted-foreground">{payment.user?.email || '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">
                        R$ {payment.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>{getPlanBadge(payment.plan_type)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.gateway || '-'}</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details Modal */}
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Pagamento</DialogTitle>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ID do Pagamento</p>
                    <p className="font-mono text-sm">{selectedPayment.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ID MercadoPago</p>
                    <p className="font-mono text-sm">{selectedPayment.mercadopago_payment_id || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor</p>
                    <p className="text-2xl font-bold text-green-500">R$ {selectedPayment.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedPayment.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Plano</p>
                    {getPlanBadge(selectedPayment.plan_type)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gateway</p>
                    <Badge variant="outline">{selectedPayment.gateway || '-'}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data Criação</p>
                    <p className="font-medium">
                      {format(new Date(selectedPayment.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assinatura</p>
                    <p className="font-medium">
                      {selectedPayment.subscription_start && selectedPayment.subscription_end
                        ? `${format(new Date(selectedPayment.subscription_start), 'dd/MM/yy')} - ${format(new Date(selectedPayment.subscription_end), 'dd/MM/yy')}`
                        : '-'}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Informações do Usuário</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p className="font-medium">{selectedPayment.user?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedPayment.user?.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-medium">{selectedPayment.user?.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ID do Usuário</p>
                      <p className="font-mono text-xs">{selectedPayment.user_id}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}