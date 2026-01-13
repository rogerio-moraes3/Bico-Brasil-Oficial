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
import { ArrowLeft, Eye, Download, Search, Filter, Wrench, CheckCircle, XCircle, Star } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WorkerService {
  id: string;
  title: string;
  description: string;
  price: number | null;
  availability: string | null;
  active: boolean;
  created_at: string;
  category_id: string | null;
  subcategory_id: string | null;
  custom_category: string | null;
  user_id: string;
  user?: {
    name: string;
    email: string | null;
    phone: string;
    rating_avg: number | null;
    rating_count: number | null;
    verified: boolean;
    city: string;
  };
  category?: {
    name: string;
  };
  subcategory?: {
    name: string;
  };
}

export default function AdminServices() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<WorkerService[]>([]);
  const [filteredServices, setFilteredServices] = useState<WorkerService[]>([]);
  const [selectedService, setSelectedService] = useState<WorkerService | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    avgPrice: 0
  });

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [services, searchTerm, statusFilter, categoryFilter]);

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

      loadServices();
      loadCategories();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/admin');
    }
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');
    
    setCategories(data || []);
  };

  const loadServices = async () => {
    setLoading(true);
    try {
      const { data: servicesData, error } = await supabase
        .from('worker_services')
        .select(`
          *,
          user:users!user_id(name, email, phone, rating_avg, rating_count, verified, city),
          category:categories!category_id(name),
          subcategory:subcategories!subcategory_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setServices(servicesData || []);

      // Calculate stats
      const activeServices = (servicesData || []).filter(s => s.active);
      const inactiveServices = (servicesData || []).filter(s => !s.active);
      const pricesWithValue = (servicesData || []).filter(s => s.price && s.price > 0);
      const avgPrice = pricesWithValue.length > 0
        ? pricesWithValue.reduce((sum, s) => sum + (s.price || 0), 0) / pricesWithValue.length
        : 0;

      setStats({
        total: (servicesData || []).length,
        active: activeServices.length,
        inactive: inactiveServices.length,
        avgPrice: Math.round(avgPrice)
      });

    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...services];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.title?.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term) ||
        s.user?.name?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => statusFilter === 'active' ? s.active : !s.active);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(s => s.category_id === categoryFilter);
    }

    setFilteredServices(filtered);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Título', 'Categoria', 'Subcategoria', 'Preço', 'Status', 'Profissional', 'Cidade', 'Rating', 'Data Criação'];
    const rows = filteredServices.map(s => [
      s.id,
      s.title,
      s.category?.name || s.custom_category || '',
      s.subcategory?.name || '',
      s.price || '',
      s.active ? 'Ativo' : 'Inativo',
      s.user?.name || '',
      s.user?.city || '',
      s.user?.rating_avg || '',
      format(new Date(s.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `servicos_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
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
            <ArrowLeft className="w-4 h-4 mr-2 text-foreground dark:text-white" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Gerenciar Serviços</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Wrench className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-gray-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Inativos</p>
                  <p className="text-2xl font-bold">{stats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Preço Médio</p>
                  <p className="text-2xl font-bold">R$ {stats.avgPrice}</p>
                </div>
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={exportToCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Services Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Serviços ({filteredServices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {service.title}
                      </TableCell>
                      <TableCell>
                        {service.category?.name || service.custom_category || '-'}
                      </TableCell>
                      <TableCell>
                        {service.price ? `R$ ${service.price}` : '-'}
                      </TableCell>
                      <TableCell>
                        {service.active ? (
                          <Badge className="bg-green-500">Ativo</Badge>
                        ) : (
                          <Badge variant="outline">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {service.user?.name}
                          {service.user?.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {service.user?.rating_avg ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>{service.user.rating_avg.toFixed(1)}</span>
                            <span className="text-muted-foreground">
                              ({service.user.rating_count})
                            </span>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{service.user?.city || '-'}</TableCell>
                      <TableCell>
                        {format(new Date(service.created_at), 'dd/MM/yy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedService(service)}
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

        {/* Service Details Modal */}
        <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Serviço</DialogTitle>
            </DialogHeader>
            {selectedService && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Título</p>
                    <p className="font-medium">{selectedService.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categoria</p>
                    <p className="font-medium">
                      {selectedService.category?.name || selectedService.custom_category || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subcategoria</p>
                    <p className="font-medium">{selectedService.subcategory?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Preço</p>
                    <p className="font-medium">
                      {selectedService.price ? `R$ ${selectedService.price}` : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Disponibilidade</p>
                    <p className="font-medium">{selectedService.availability || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {selectedService.active ? (
                      <Badge className="bg-green-500">Ativo</Badge>
                    ) : (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="font-medium">{selectedService.description}</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Informações do Profissional</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p className="font-medium">{selectedService.user?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-medium">{selectedService.user?.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedService.user?.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cidade</p>
                      <p className="font-medium">{selectedService.user?.city}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="font-medium">
                        {selectedService.user?.rating_avg 
                          ? `${selectedService.user.rating_avg.toFixed(1)} (${selectedService.user.rating_count} avaliações)`
                          : 'Sem avaliações'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Verificado</p>
                      <p className="font-medium">
                        {selectedService.user?.verified ? 'Sim' : 'Não'}
                      </p>
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