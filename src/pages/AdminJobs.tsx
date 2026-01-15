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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Eye, Edit, Trash2, Download, Search, Filter, Briefcase, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string | null;
  city: string | null;
  neighborhood: string | null;
  status: string;
  urgent: boolean;
  created_at: string;
  date_time: string | null;
  contractor_name: string;
  contractor_phone: string;
  contractor_id: string | null;
  views_count?: number;
  contacts_count?: number;
}

export default function AdminJobs() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [urgentFilter, setUrgentFilter] = useState('all');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    urgent: 0
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchTerm, statusFilter, categoryFilter, cityFilter, urgentFilter]);

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

      loadJobs();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/admin');
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    try {
      // Load jobs with views and contacts count
      const { data: jobsData, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get views count for each job
      const { data: viewsData } = await supabase
        .from('job_views')
        .select('job_id');

      // Get contacts count for each job
      const { data: contactsData } = await supabase
        .from('job_contacts')
        .select('job_id');

      // Count views and contacts per job
      const viewsCount: Record<string, number> = {};
      const contactsCount: Record<string, number> = {};

      viewsData?.forEach(v => {
        viewsCount[v.job_id] = (viewsCount[v.job_id] || 0) + 1;
      });

      contactsData?.forEach(c => {
        contactsCount[c.job_id] = (contactsCount[c.job_id] || 0) + 1;
      });

      const enrichedJobs = (jobsData || []).map(job => ({
        ...job,
        views_count: viewsCount[job.id] || 0,
        contacts_count: contactsCount[job.id] || 0
      }));

      setJobs(enrichedJobs);

      // Calculate stats
      const activeJobs = enrichedJobs.filter(j => j.status === 'published');
      const inactiveJobs = enrichedJobs.filter(j => j.status !== 'published');
      const urgentJobs = enrichedJobs.filter(j => j.urgent);

      setStats({
        total: enrichedJobs.length,
        active: activeJobs.length,
        inactive: inactiveJobs.length,
        urgent: urgentJobs.length
      });

      // Extract unique categories and cities
      const uniqueCategories = [...new Set(enrichedJobs.map(j => j.category).filter(Boolean))];
      const uniqueCities = [...new Set(enrichedJobs.map(j => j.city).filter(Boolean))] as string[];

      setCategories(uniqueCategories);
      setCities(uniqueCities);

    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Erro ao carregar anúncios');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(j =>
        j.title?.toLowerCase().includes(term) ||
        j.description?.toLowerCase().includes(term) ||
        j.contractor_name?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(j => j.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(j => j.category === categoryFilter);
    }

    if (cityFilter !== 'all') {
      filtered = filtered.filter(j => j.city === cityFilter);
    }

    if (urgentFilter !== 'all') {
      filtered = filtered.filter(j => urgentFilter === 'urgent' ? j.urgent : !j.urgent);
    }

    setFilteredJobs(filtered);
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobToDelete.id);

      if (error) throw error;

      toast.success('Anúncio excluído com sucesso');
      setShowDeleteModal(false);
      setJobToDelete(null);
      loadJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Erro ao excluir anúncio');
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Título', 'Categoria', 'Cidade', 'Bairro', 'Status', 'Urgente', 'Criado Por', 'Data Criação', 'Visualizações', 'Contatos'];
    const rows = filteredJobs.map(j => [
      j.id,
      j.title,
      j.category,
      j.city || '',
      j.neighborhood || '',
      j.status,
      j.urgent ? 'Sim' : 'Não',
      j.contractor_name,
      format(new Date(j.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      j.views_count || 0,
      j.contacts_count || 0
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `anuncios_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Ativo</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">Em Andamento</Badge>;
      case 'done':
        return <Badge className="bg-gray-500">Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
            <ArrowLeft className="w-4 h-4 mr-2 text-[var(--nav-link)]" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Gerenciar Anúncios (Jobs)</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-primary" />
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
                <AlertTriangle className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Urgentes</p>
                  <p className="text-2xl font-bold">{stats.urgent}</p>
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="published">Ativo</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Cidades</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={urgentFilter} onValueChange={setUrgentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Urgência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="urgent">Urgentes</SelectItem>
                  <SelectItem value="normal">Normais</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={exportToCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Anúncios ({filteredJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Urgente</TableHead>
                    <TableHead>Criado Por</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Contatos</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {job.title}
                      </TableCell>
                      <TableCell>{job.category}</TableCell>
                      <TableCell>{job.city || '-'}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>
                        {job.urgent ? (
                          <Badge className="bg-orange-500">Sim</Badge>
                        ) : (
                          <Badge variant="outline">Não</Badge>
                        )}
                      </TableCell>
                      <TableCell>{job.contractor_name}</TableCell>
                      <TableCell>
                        {format(new Date(job.created_at), 'dd/MM/yy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>{job.views_count}</TableCell>
                      <TableCell>{job.contacts_count}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedJob(job)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/edit-job/${job.id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500"
                            onClick={() => {
                              setJobToDelete(job);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Job Details Modal */}
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Anúncio</DialogTitle>
            </DialogHeader>
            {selectedJob && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Título</p>
                    <p className="font-medium">{selectedJob.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categoria</p>
                    <p className="font-medium">{selectedJob.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subcategoria</p>
                    <p className="font-medium">{selectedJob.subcategory || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedJob.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cidade</p>
                    <p className="font-medium">{selectedJob.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bairro</p>
                    <p className="font-medium">{selectedJob.neighborhood || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Criado Por</p>
                    <p className="font-medium">{selectedJob.contractor_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{selectedJob.contractor_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data Criação</p>
                    <p className="font-medium">
                      {format(new Date(selectedJob.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data Agendada</p>
                    <p className="font-medium">
                      {selectedJob.date_time
                        ? format(new Date(selectedJob.date_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                        : '-'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="font-medium">{selectedJob.description}</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedJob.views_count} visualizações</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedJob.contacts_count} contatos</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o anúncio "{jobToDelete?.title}"? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteJob}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}