import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import CitySelect from '@/components/CitySelect';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useCities } from '@/hooks/useCities';
import { Loader2, Briefcase } from 'lucide-react';

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    category: '',
    city_id: '',
    neighborhood: '',
    urgent: false,
    date_time: '',
    availability: 'todos_os_dias',
    customCategory: '',
    isCustomCategory: false
  });

  const { cities, loading: citiesLoading } = useCities();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    const [categoriesRes, profileRes] = await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('users').select('city_id, neighborhood').eq('auth_id', user!.id).single()
    ]);

    setCategories(categoriesRes.data || []);

    if (profileRes.data) {
      setFormData(prev => ({ ...prev, city_id: profileRes.data.city_id || '', neighborhood: profileRes.data.neighborhood || '' }));
    }
  };

  // Aplicar cidade do user.metadata como fallback quando cidades carregadas
  useEffect(() => {
    if (cities.length && user?.user_metadata?.city_id && !formData.city_id) {
      const hasCity = cities.find(c => String(c.id) === String(user.user_metadata.city_id));
      if (hasCity) setFormData(prev => ({ ...prev, city_id: user.user_metadata.city_id }));
    }
  }, [cities, user, formData.city_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {

      // Validações
      if (!formData.title.trim()) {
        throw new Error('Título do trabalho é obrigatório');
      }
      if (!formData.description.trim()) {
        throw new Error('Descrição é obrigatória');
      }
      if (!formData.category) {
        throw new Error('Categoria é obrigatória');
      }
      if (!formData.city_id) {
        throw new Error('Cidade é obrigatória');
      }



      // Buscar user_id e verificar publicações grátis
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, user_role, free_posts_remaining')
        .eq('auth_id', user!.id)
        .single();

      if (userError) {
        console.error('❌ Erro ao buscar usuário:', userError);
        throw new Error('Erro ao buscar dados do usuário: ' + userError.message);
      }

      if (!userData) {
        console.error('❌ Usuário não encontrado no banco');
        throw new Error('Usuário não encontrado. Complete seu perfil primeiro.');
      }

      // Verificar se empregador tem publicações grátis
      if (userData.user_role === 'empregador' && userData.free_posts_remaining === 0) {
        toast({
          title: "Publicações grátis esgotadas",
          description: "Você já usou suas 10 publicações grátis. Assine um plano premium para continuar publicando.",
          variant: "destructive"
        });
        setLoading(false);
        navigate('/premium');
        return;
      }



      // Criar publicação
      const { data: jobData, error: jobError } = await supabase
        .from('job_postings')
        .insert({
          user_id: userData.id,
          title: formData.title,
          description: formData.description,
          price: formData.price ? parseFloat(formData.price) : null,
          location: formData.location || null,
          category_id: formData.isCustomCategory ? null : formData.category,
          custom_category: formData.isCustomCategory ? formData.customCategory.trim() : null,
          city_id: formData.city_id,
          neighborhood: formData.neighborhood,
          urgent: formData.urgent,
          date_time: formData.date_time ? new Date(formData.date_time).toISOString() : null,
          availability: formData.availability,
          status: 'open'
        })
        .select();

      if (jobError) {
        console.error('❌ Erro ao inserir job_posting:', jobError);
        throw new Error('Erro ao publicar: ' + jobError.message);
      }



      // Decrementar publicações grátis se for empregador
      if (userData.user_role === 'empregador' && userData.free_posts_remaining > 0) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ free_posts_remaining: userData.free_posts_remaining - 1 })
          .eq('id', userData.id);

        if (!updateError) {
          const remaining = userData.free_posts_remaining - 1;
          toast({
            title: "Trabalho publicado",
            description: `Profissionais poderão visualizar e entrar em contato. Você tem ${remaining} publicações grátis restantes.`
          });
        }
      } else {
        toast({
          title: "Trabalho publicado",
          description: "Profissionais poderão visualizar e entrar em contato."
        });
      }

      navigate('/jobs');
    } catch (error: any) {
      console.error('❌ Erro geral:', error);
      toast({
        title: "Erro ao publicar trabalho",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />


      <main className="flex-grow container mx-auto px-4 py-8 pb-20 md:pb-8">
        <Breadcrumbs />

        <Card className="max-w-3xl mx-auto max-h-[80vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-primary" />
              <CardTitle>Publicar Trabalho</CardTitle>
            </div>
            <p className="text-muted-foreground">
              Descreva o trabalho e receba propostas de profissionais
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Título do Trabalho *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Preciso de um encanador para consertar vazamento"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o trabalho, materiais necessários, prazos..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="price">Preço Oferecido (opcional)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Ex: 150"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="location">Endereço/Local (opcional)</Label>
                <Input
                  id="location"
                  placeholder="Ex: Rua das Flores, 123"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      if (value === 'outros') {
                        setFormData({ ...formData, category: value, isCustomCategory: true });
                      } else {
                        setFormData({ ...formData, category: value, isCustomCategory: false, customCategory: '' });
                      }
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.sort((a, b) => a.name.localeCompare(b.name)).map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Campo personalizado "Outros" */}
                  {formData.category === 'outros' && (
                    <div className="mt-2">
                      <Input
                        value={formData.customCategory}
                        onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                        placeholder="Descreva o tipo de trabalho"
                        required
                        maxLength={100}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <CitySelect
                    value={formData.city_id}
                    onChange={(value) => setFormData({ ...formData, city_id: value })}
                    cities={cities}
                    includeAll={false}
                    placeholder="Selecione"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="neighborhood">Bairro (opcional)</Label>
                <Input
                  id="neighborhood"
                  placeholder="Digite o bairro"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="date_time">Data/Hora Desejada (opcional)</Label>
                <Input
                  id="date_time"
                  type="datetime-local"
                  value={formData.date_time}
                  onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
                />
              </div>

              <div>
                <Label>Disponibilidade *</Label>
                <Select value={formData.availability} onValueChange={(val) => setFormData({ ...formData, availability: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos_os_dias">Todos os dias</SelectItem>
                    <SelectItem value="seg_sex">Segunda a Sexta</SelectItem>
                    <SelectItem value="finais_semana">Finais de semana</SelectItem>
                    <SelectItem value="agendamento">Somente por agendamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="urgent"
                  checked={formData.urgent}
                  onCheckedChange={(checked) => setFormData({ ...formData, urgent: checked })}
                />
                <Label htmlFor="urgent" className="cursor-pointer">
                  Trabalho Urgente
                </Label>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  'Publicar Trabalho'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
