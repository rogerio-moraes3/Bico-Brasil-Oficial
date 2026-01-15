import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FavoritesTab } from '@/components/FavoritesTab';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { MyAdsTab } from '@/components/MyAdsTab';
import { MediaUpload } from '@/components/MediaUpload';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Briefcase,
  Eye,
  EyeOff,
  KeyRound,
  Calendar,
  Edit2,
  LogOut,
  Upload,
  Camera,
  Loader2,
  Trash2
} from 'lucide-react';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    phone_type: 'whatsapp_only',
    primary_contact_method: 'whatsapp',
    neighborhood: '',
    address: '',
    street_number: '',
    city: '',
    state: 'SP',
    zip_code: '',
    description: '',
    price: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .maybeSingle();

    if (error) {
      toast({
        title: "Erro ao carregar perfil",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setProfile(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        phone_type: (data as any).phone_type || 'whatsapp_only',
        primary_contact_method: (data as any).primary_contact_method || 'whatsapp',
        neighborhood: data.neighborhood || '',
        address: (data as any).address || '',
        street_number: (data as any).street_number || '',
        city: data.city || '',
        state: (data as any).state || 'SP',
        zip_code: (data as any).zip_code || '',
        description: data.description || '',
        price: data.price || ''
      });
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Formatar bairro (primeira letra maiúscula) se fornecido
    const formattedNeighborhood = formData.neighborhood.trim()
      ? formData.neighborhood.trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      : '';

    setLoading(true);

    const { error } = await supabase
      .from('users')
      .update({
        ...formData,
        neighborhood: formattedNeighborhood || null,
        updated_at: new Date().toISOString()
      })
      .eq('auth_id', user.id);

    if (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram atualizadas com sucesso"
      });
      setEditing(false);
      loadProfile();
    }

    setLoading(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Use JPG, PNG ou WEBP",
        variant: "destructive"
      });
      return;
    }

    // Validação de tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "Tamanho máximo: 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Upload para Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user!.id}/${fileName}`; // Estrutura: {user_id}/nome-da-foto.jpg

      const { error: uploadError } = await supabase.storage
        .from('profiles') // Bucket atualizado para 'profiles'
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('profiles') // Bucket atualizado para 'profiles'
        .getPublicUrl(filePath);

      // Atualizar banco
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl }) // Campo correto: avatar_url
        .eq('auth_id', user!.id);

      if (updateError) throw updateError;

      // CRÍTICO: Atualizar user_metadata para persistência após logout
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
          profile_photo: publicUrl // Fallback
        }
      });

      if (metadataError) throw metadataError;

      // Atualizar state local
      setProfile({ ...profile, avatar_url: publicUrl });

      // Forçar refresh da sessão para atualizar Header
      await supabase.auth.refreshSession();

      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi alterada com sucesso."
      });

    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Erro ao enviar foto",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // Mostrar toast e navegar ANTES do signOut para evitar tela preta
    toast({
      title: "Logout realizado",
      description: "Até logo!"
    });
    navigate('/');
    // SignOut em background
    await signOut();
  };

  const handleDeleteAccount = async () => {
    const confirmText = prompt(
      'ATENÇÃO: Esta ação é irreversível!\n\n' +
      'Digite "EXCLUIR" para confirmar a exclusão permanente da sua conta:'
    );

    if (confirmText !== 'EXCLUIR') {
      toast({
        title: "Cancelado",
        description: "A exclusão da conta foi cancelada."
      });
      return;
    }

    try {
      setLoading(true);

      // 1. Soft delete: marcar como inativo
      const { error: updateError } = await supabase
        .from('users')
        .update({
          plan_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('auth_id', user!.id);

      if (updateError) throw updateError;

      // 2. Deletar conta do Auth
      const { error: authError } = await supabase.auth.signOut();
      if (authError) throw authError;

      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso. Esperamos vê-lo novamente!"
      });

      navigate('/');
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error);
      toast({
        title: "Erro ao excluir conta",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    try {
      setChangingPassword(true);

      // Supabase Auth update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Senha alterada!",
        description: "Sua senha foi alterada com sucesso"
      });

      // Limpar campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <p className="text-center mb-4">Perfil não encontrado. Complete seu cadastro.</p>
              <Button onClick={() => navigate('/auth?mode=signup')} className="w-full">
                Completar Cadastro
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const initials = profile.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U';

  return (
    <>

      <Header />
      <div className="min-h-screen bg-muted/30 py-8 pb-20 md:pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Breadcrumbs />

          {/* Profile Header */}
          <Card className="mb-6 animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={
                        user?.user_metadata?.avatar_url ||
                        user?.user_metadata?.picture
                      } />
                      <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                    </Avatar>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background"
                      onClick={() => document.getElementById('profile-photo-upload')?.click()}
                      title="Alterar foto"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <input
                      id="profile-photo-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-2xl mb-2">{profile.name}</CardTitle>
                    <div className="space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">
                          {profile.type === 'worker' ? 'Prestador' : 'Contratante'}
                        </Badge>
                        {profile.plan_active && (
                          <Badge className="bg-primary/10 text-primary">Plano Pro</Badge>
                        )}
                        {profile.verified && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                            ✓ Verificado
                          </Badge>
                        )}
                        {profile.rating_avg > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {profile.rating_avg.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                      <BadgeDisplay userId={profile.id} />
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="info" className="animate-slide-up">
            <div className="w-full overflow-x-auto">
              <TabsList className="inline-flex w-auto min-w-full gap-2 bg-slate-100 dark:bg-muted/50 p-2 rounded-lg border border-slate-200 dark:border-transparent shadow-sm">
                <TabsTrigger value="info" className="flex-shrink-0 text-xs md:text-sm whitespace-nowrap">
                  Info
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex-shrink-0 text-xs md:text-sm whitespace-nowrap">
                  Favoritos
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex-shrink-0 text-xs md:text-sm whitespace-nowrap">
                  Notificações
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-shrink-0 text-xs md:text-sm whitespace-nowrap">
                  Histórico
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex-shrink-0 text-xs md:text-sm whitespace-nowrap">
                  Stats
                </TabsTrigger>
                <TabsTrigger value="subscription" className="flex-shrink-0 text-xs md:text-sm whitespace-nowrap">
                  Assinatura
                </TabsTrigger>
                <TabsTrigger value="myads" className="flex-shrink-0 text-xs md:text-sm whitespace-nowrap">
                  Meus Anúncios
                </TabsTrigger>
                <TabsTrigger value="security" className="flex-shrink-0 text-xs md:text-sm whitespace-nowrap">
                  Segurança
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="info">
              <Card className="border-2 border-border dark:border-transparent shadow-md bg-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Dados Pessoais</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(!editing)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      {editing ? 'Cancelar' : 'Editar'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Ex: São José dos Campos"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone_type">Tipo de Contato</Label>
                        <Select
                          value={formData.phone_type}
                          onValueChange={(value) => setFormData({ ...formData, phone_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Como prefere ser contatado?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="whatsapp_only">📱 Somente WhatsApp</SelectItem>
                            <SelectItem value="whatsapp_and_call">📞 WhatsApp e Ligação</SelectItem>
                            <SelectItem value="call_only">☎️ Somente Ligação</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="primary_contact_method">Melhor forma de contato</Label>
                        <Select
                          value={formData.primary_contact_method}
                          onValueChange={(value) => setFormData({ ...formData, primary_contact_method: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="call">Ligação</SelectItem>
                            <SelectItem value="both">Ambos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="neighborhood">Bairro (opcional)</Label>
                        <Input
                          id="neighborhood"
                          value={formData.neighborhood}
                          onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                          placeholder="Ex: Centro"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Endereço</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Rua, Avenida..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="street_number">Número</Label>
                          <Input
                            id="street_number"
                            value={formData.street_number}
                            onChange={(e) => setFormData({ ...formData, street_number: e.target.value })}
                            placeholder="123"
                          />
                        </div>
                        <div>
                          <Label htmlFor="zip_code">CEP</Label>
                          <Input
                            id="zip_code"
                            value={formData.zip_code}
                            onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                            placeholder="00000-000"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Ex: São José dos Campos"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          placeholder="SP"
                        />
                      </div>
                      {profile.type === 'worker' && (
                        <>
                          <div>
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              rows={4}
                            />
                          </div>
                          <div>
                            <Label htmlFor="price">Preço</Label>
                            <Input
                              id="price"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              placeholder="Ex: R$ 150/dia"
                            />
                          </div>
                        </>
                      )}
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>

                      {/* Zona de Perigo - Excluir Conta */}
                      <div className="mt-8 pt-8 border-t border-destructive/20">
                        <h3 className="text-lg font-semibold text-destructive mb-4">
                          Zona de Perigo
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          A exclusão da conta é permanente e irreversível. Todos os seus dados serão removidos.
                        </p>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Excluindo...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir Conta Permanentemente
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <span>{profile.email}</span>
                      </div>
                      {profile.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                      {(profile.address || profile.city) && (
                        <div className="pt-4 border-t">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Endereço
                          </h4>
                          <div className="space-y-2 text-sm">
                            {profile.address && (
                              <div className="text-muted-foreground">
                                {profile.address}
                                {profile.street_number && `, ${profile.street_number}`}
                              </div>
                            )}
                            {profile.neighborhood && (
                              <div className="text-muted-foreground">
                                Bairro: {profile.neighborhood}
                              </div>
                            )}
                            {profile.city && (
                              <div className="text-muted-foreground">
                                {profile.city} - {profile.state || 'SP'}
                              </div>
                            )}
                            {profile.zip_code && (
                              <div className="text-muted-foreground">
                                CEP: {profile.zip_code}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {profile.type === 'worker' && profile.description && (
                        <div className="pt-4 border-t">
                          <h4 className="font-semibold mb-2">Sobre</h4>
                          <p className="text-muted-foreground">{profile.description}</p>
                        </div>
                      )}
                      {profile.type === 'worker' && profile.price && (
                        <div className="flex items-center gap-3">
                          <Briefcase className="h-5 w-5 text-muted-foreground" />
                          <span className="font-semibold text-primary">{profile.price}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <FavoritesTab />
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <NotificationsPanel />
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Trabalhos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum trabalho registrado ainda</p>
                    <Button asChild className="mt-4">
                      <a href="/jobs">Buscar Trabalhos</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats">
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Trabalhos Concluídos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{profile.jobs_done || 0}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Avaliação Média
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold">
                        {profile.rating_avg > 0 ? profile.rating_avg.toFixed(1) : '-'}
                      </p>
                      {profile.rating_avg > 0 && (
                        <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total de Avaliações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{profile.rating_count || 0}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Status do Plano</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.plan_active ? (
                    <div className="space-y-2">
                      <Badge className="bg-green-500">Plano Pro Ativo</Badge>
                      <p className="text-sm text-muted-foreground">
                        Você tem acesso a todos os recursos premium
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Badge variant="outline">Plano Gratuito</Badge>
                      <p className="text-sm text-muted-foreground">
                        Faça upgrade para ter maior visibilidade
                      </p>
                      <Button size="sm" className="mt-2">Assinar Plano Pro</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Assinatura</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status da Assinatura */}
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <h3 className="font-semibold mb-2">Status Atual</h3>
                    {profile.plan_active ? (
                      <div className="space-y-2">
                        <Badge className="bg-green-500">Plano Pro Ativo</Badge>
                        <p className="text-sm text-muted-foreground">
                          Você tem acesso a todos os recursos premium
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Badge variant="outline">Plano Gratuito</Badge>
                        <p className="text-sm text-muted-foreground">
                          Você está no plano gratuito com funcionalidades limitadas
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Créditos Restantes */}
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <h3 className="font-semibold mb-2">Créditos de Visualização</h3>
                    <p className="text-2xl font-bold text-primary">
                      {profile.view_credits ?? 3} / 3
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Visualizações de contato gratuitas restantes
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => navigate('/payment-history')}
                      variant="outline"
                      className="w-full"
                    >
                      Ver Histórico de Pagamentos
                    </Button>

                    {!profile.plan_active && (
                      <Button
                        onClick={() => navigate('/premium')}
                        className="w-full"
                      >
                        Assinar Plano Pro
                      </Button>
                    )}

                    {profile.plan_active && (
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={async () => {
                          if (!confirm('Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos premium.')) return;

                          try {
                            const { error } = await supabase
                              .from('users')
                              .update({
                                plan_active: false
                              })
                              .eq('auth_id', user?.id);

                            if (error) throw error;

                            toast({
                              title: "Assinatura cancelada",
                              description: "Sua assinatura foi cancelada com sucesso."
                            });
                            loadProfile();
                          } catch (err: any) {
                            toast({
                              title: "Erro ao cancelar",
                              description: err.message,
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        Cancelar Assinatura
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5" />
                    Segurança da Conta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••"
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-new-password">Confirmar Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="confirm-new-password"
                          type={showConfirmNewPassword ? "text" : "password"}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="••••••"
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        >
                          {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" disabled={changingPassword} className="w-full">
                      {changingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Alterando...
                        </>
                      ) : (
                        <>
                          <KeyRound className="h-4 w-4 mr-2" />
                          Alterar Senha
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Ads Tab */}
            <TabsContent value="myads">
              <MyAdsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
}
