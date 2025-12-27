import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ShareButtons } from '@/components/ShareButtons';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function OfferServices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    service_title: '',
    category: '',
    subcategory: '',
    description: '',
    price: '',
    city_id: '',
    neighborhood: '',
    address: '',
    phone: '',
    availability: 'todos_os_dias',
    customCategory: '',
    isCustomCategory: false
  });

  const [cities, setCities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    const [citiesRes, categoriesRes, profileRes] = await Promise.all([
      supabase.from('cities').select('*').eq('active', true),
      supabase.from('categories').select('*'),
      supabase.from('users').select('phone, city_id, neighborhood').eq('auth_id', user!.id).single()
    ]);

    setCities(citiesRes.data || []);
    setCategories(categoriesRes.data || []);

    if (profileRes.data) {
      setFormData(prev => ({
        ...prev,
        phone: profileRes.data.phone || '',
        city_id: profileRes.data.city_id || '',
        neighborhood: profileRes.data.neighborhood || ''
      }));
    }
  };

  const handleCategoryChange = async (categoryId: string) => {
    if (categoryId === 'outros') {
      setFormData({ 
        ...formData, 
        category: categoryId, 
        subcategory: '',
        isCustomCategory: true 
      });
      setSubcategories([]);
    } else {
      setFormData({ 
        ...formData, 
        category: categoryId, 
        subcategory: '',
        isCustomCategory: false,
        customCategory: ''
      });
      
      const { data } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId);
      
      setSubcategories(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      if (!formData.service_title.trim()) {
        throw new Error('Título do serviço é obrigatório');
      }
      if (!formData.category) {
        throw new Error('Categoria é obrigatória');
      }
      if (!formData.description.trim()) {
        throw new Error('Descrição é obrigatória');
      }
      if (!formData.city_id) {
        throw new Error('Cidade é obrigatória');
      }
      if (!formData.phone.trim()) {
        throw new Error('Telefone é obrigatório');
      }

      // 1. Atualizar perfil do usuário
      const { error: userError } = await supabase
        .from('users')
        .update({
          type: 'worker',
          phone: formData.phone,
          city_id: formData.city_id,
          neighborhood: formData.neighborhood,
          updated_at: new Date().toISOString()
        })
        .eq('auth_id', user!.id);

      if (userError) throw userError;

      // 2. Buscar user_id do usuário autenticado
      const { data: userData, error: getUserError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user!.id)
        .single();

      if (getUserError || !userData) {
        throw new Error('Usuário não encontrado');
      }

      // 3. Criar registro na tabela worker_services
      const { error: serviceError } = await supabase
        .from('worker_services')
        .insert({
          user_id: userData.id,
          title: formData.service_title,
          description: formData.description,
          category_id: formData.isCustomCategory ? null : formData.category,
          custom_category: formData.isCustomCategory ? formData.customCategory.trim() : null,
          subcategory_id: formData.subcategory || null,
          price: formData.price ? parseFloat(formData.price) : null,
          availability: formData.availability,
          active: true
        });

      if (serviceError) throw serviceError;

      toast({
        title: "Serviço cadastrado!",
        description: "Seu serviço está visível para clientes.",
      });

      navigate('/profile');

    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar serviço",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8 max-w-3xl">
        <Card className="max-h-[80vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Oferecer Meus Serviços</CardTitle>
                <p className="text-muted-foreground">
                  Cadastre seu serviço e seja encontrado por clientes
                </p>
              </div>
              <ShareButtons 
                text="Quer fazer bicos e ganhar dinheiro extra? Cadastre-se no Bico Brasil!" 
                url="https://bicobrasil.com.br/offer-services"
              />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Título do Serviço */}
              <div>
                <Label htmlFor="service_title">Título do Serviço *</Label>
                <Input
                  id="service_title"
                  placeholder="Ex: Sou pedreiro — Faço reboco, contrapiso, reformas"
                  value={formData.service_title}
                  onChange={(e) => setFormData({...formData, service_title: e.target.value})}
                  required
                />
              </div>

              {/* Categoria */}
              <div>
                <Label>Categoria *</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.sort((a, b) => a.name.localeCompare(b.name)).map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campo personalizado "Outros" */}
              {formData.category === 'outros' && (
                <div>
                  <Label htmlFor="customCategory">Descreva sua especialidade *</Label>
                  <Input
                    id="customCategory"
                    placeholder="Ex: Instalação de antenas, montagem de móveis planejados..."
                    value={formData.customCategory}
                    onChange={(e) => setFormData({...formData, customCategory: e.target.value})}
                    required
                    maxLength={100}
                  />
                </div>
              )}

              {/* Subcategoria */}
              {formData.category && !formData.isCustomCategory && subcategories.length > 0 && (
                <div>
                  <Label>Subcategoria</Label>
                  <Select value={formData.subcategory} onValueChange={(val) => setFormData({...formData, subcategory: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a subcategoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map(sub => (
                        <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Descrição */}
              <div>
                <Label htmlFor="description">Descrição Detalhada *</Label>
                <Textarea
                  id="description"
                  placeholder="Ex: Sou pedreiro com 8 anos de experiência. Faço reboco, contrapiso, colocação de pisos, reformas e manutenções gerais. Orçamentos sem compromisso."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={5}
                  required
                />
              </div>

              {/* Preço */}
              <div>
                <Label htmlFor="price">Preço Médio (opcional)</Label>
                <Input
                  id="price"
                  placeholder="Ex: R$ 150 por diária / R$ 40 m²"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>

              {/* Cidade */}
              <div>
                <Label>Cidade *</Label>
                <Select value={formData.city_id} onValueChange={(val) => setFormData({...formData, city_id: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bairro - Opcional */}
              <div>
                <Label htmlFor="neighborhood">Bairro (opcional)</Label>
                <Input
                  id="neighborhood"
                  placeholder="Digite o bairro"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                />
              </div>

              {/* Endereço */}
              <div>
                <Label htmlFor="address">Endereço (opcional)</Label>
                <Input
                  id="address"
                  placeholder="Rua, número, complemento"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              {/* Telefone */}
              <div>
                <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(18) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>

              {/* Disponibilidade */}
              <div>
                <Label>Disponibilidade *</Label>
                <Select value={formData.availability} onValueChange={(val) => setFormData({...formData, availability: val})}>
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  "Publicar Meu Serviço"
                )}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
