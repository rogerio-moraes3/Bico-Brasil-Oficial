import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wrench, ArrowLeft } from 'lucide-react';
import { safeGoBack } from '@/lib/utils';

export default function EditService() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    subcategory_id: '',
    price: '',
    availability: 'todos_os_dias',
    active: true
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadData();
  }, [user, navigate, id]);

  useEffect(() => {
    // Carregar subcategorias quando categoria muda
    if (formData.category_id) {
      loadSubcategories(formData.category_id);
    }
  }, [formData.category_id]);

  const loadData = async () => {
    const [categoriesRes, serviceRes] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('worker_services').select('*').eq('id', id).single()
    ]);

    setCategories(categoriesRes.data || []);

    if (serviceRes.data) {
      setFormData({
        title: serviceRes.data.title,
        description: serviceRes.data.description,
        category_id: serviceRes.data.category_id || '',
        subcategory_id: serviceRes.data.subcategory_id || '',
        price: serviceRes.data.price?.toString() || '',
        availability: serviceRes.data.availability || 'todos_os_dias',
        active: serviceRes.data.active ?? true
      });

      // Carregar subcategorias se houver categoria
      if (serviceRes.data.category_id) {
        await loadSubcategories(serviceRes.data.category_id);
      }
    } else {
      toast({
        title: "Serviço não encontrado",
        description: "Este serviço não existe ou você não tem permissão para editá-lo.",
        variant: "destructive"
      });
      navigate('/profile');
    }

    setLoadingData(false);
  };

  const loadSubcategories = async (categoryId: string) => {
    const { data } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', categoryId)
      .order('name');

    setSubcategories(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title.trim()) {
        throw new Error('Título do serviço é obrigatório');
      }
      if (!formData.description.trim()) {
        throw new Error('Descrição é obrigatória');
      }

      // Check schema for availability column to avoid runtime errors
      const { hasColumn } = await import('@/lib/schemaCheck');
      const availabilityExists = await hasColumn('worker_services', 'availability');

      const updatePayload: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category_id: formData.category_id || null,
        subcategory_id: formData.subcategory_id || null,
        price: formData.price ? parseFloat(formData.price) : null,
        active: formData.active,
        updated_at: new Date().toISOString()
      };

      if (availabilityExists) {
        updatePayload.availability = formData.availability;
      }

      // Try to update; if schema changed unexpectedly, retry without availability as a fallback
      let updateError: any = null;
      let res = await supabase.from('worker_services').update(updatePayload).eq('id', id);
      if (res.error) {
        updateError = res.error;
        if (updateError.message?.toLowerCase?.().includes('availability')) {
          delete updatePayload.availability;
          const retryRes = await supabase.from('worker_services').update(updatePayload).eq('id', id);
          if (retryRes.error) throw retryRes.error;
        } else {
          throw updateError;
        }
      }

      toast({
        title: "Serviço atualizado",
        description: "Seu serviço foi atualizado com sucesso"
      });

      navigate('/profile');
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar serviço",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pb-20 md:pb-0">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumbs />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => safeGoBack(navigate, '/profile')}
          className="mb-4 text-[var(--nav-link)]"
        >
          <ArrowLeft className="h-4 w-4 mr-2 text-[var(--nav-link)]" />
          Voltar
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Editar Serviço
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Serviço *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Pintura residencial"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição Detalhada *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva seu serviço em detalhes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value, subcategory_id: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategoria</Label>
                  <Select
                    value={formData.subcategory_id}
                    onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}
                    disabled={!formData.category_id || subcategories.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 150.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Disponibilidade</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value) => setFormData({ ...formData, availability: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos_os_dias">Todos os dias</SelectItem>
                      <SelectItem value="dias_uteis">Dias úteis</SelectItem>
                      <SelectItem value="fins_de_semana">Fins de semana</SelectItem>
                      <SelectItem value="manha">Manhã</SelectItem>
                      <SelectItem value="tarde">Tarde</SelectItem>
                      <SelectItem value="noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Serviço Ativo</Label>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Alterações
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => safeGoBack(navigate, '/profile')}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
