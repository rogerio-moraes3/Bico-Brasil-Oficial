import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FavoriteButton } from '@/components/FavoriteButton';
import { Star, MapPin, Phone, Mail, Calendar, MessageSquare, CheckCircle, Lock, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccessControl } from '@/hooks/useAccessControl';
import { UpgradeModal } from '@/components/UpgradeModal';
import { WhatsAppContactButton } from '@/components/WhatsAppContactButton';

interface WorkerData {
  id: string;
  auth_id: string;
  name: string;
  city: string;
  neighborhood: string;
  state: string;
  category: string;
  subcategory: string;
  description: string;
  availability: string;
  price: string;
  verified: boolean;
  rating_avg: number;
  rating_count: number;
  jobs_done: number;
  created_at: string;
  profile_photo?: string;
}

interface WorkerContactData {
  phone: string;
  email: string;
}

interface Rating {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  rating_user_id: string;
}

export default function WorkerProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [worker, setWorker] = useState<WorkerData | null>(null);
  const [contactInfo, setContactInfo] = useState<WorkerContactData | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isWorkerUnlocked, setIsWorkerUnlocked] = useState(false);

  const {
    isTester,
    canViewContacts,
    recordProfileView,
    remainingFreeViews,
    remainingFreeUnlocks
  } = useAccessControl();

  useEffect(() => {
    if (id) {
      loadWorkerData();

      // Registrar visualização (se não for tester ou premium)
      if (!isTester && user) {
        recordProfileView(id);
      }
    }
  }, [id, user, isTester, canViewContacts]);

  const loadWorkerData = async () => {
    if (!id) return;

    // Validar formato do UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.error('❌ ID inválido:', id);
      toast({
        title: "Link inválido",
        description: "Este perfil não existe.",
        variant: "destructive"
      });
      navigate('/jobs');
      return;
    }

    console.log('🔍 Carregando perfil do profissional ID:', id);

    try {
      // Fetch worker data 
      const { data: workerData, error: workerError } = await supabase
        .from('users')
        .select(`
          id, auth_id, name, city, neighborhood, state,
          description, availability, price, profile_photo,
          verified, rating_avg, rating_count, jobs_done, created_at
        `)
        .eq('id', id)
        .eq('type', 'worker')
        .single();

      if (workerError) {
        console.error('❌ Erro ao carregar profissional:', workerError);
        toast({
          title: "Profissional não encontrado",
          description: "Este perfil não está disponível no momento.",
          variant: "destructive"
        });
        setLoading(false);
        navigate('/jobs');
        return;
      }

      if (!workerData) {
        console.error('❌ Profissional não existe');
        toast({
          title: "Profissional não encontrado",
          description: "Este perfil não existe.",
          variant: "destructive"
        });
        setLoading(false);
        navigate('/jobs');
        return;
      }

      setWorker({
        ...workerData,
        category: 'Profissional',
        subcategory: null
      });

      // Verificar se worker já foi desbloqueado
      if (user) {
        const { data: unlockData } = await supabase
          .from('contact_unlocks')
          .select('id')
          .eq('user_id', user.id)
          .eq('worker_id', id)
          .maybeSingle();

        setIsWorkerUnlocked(!!unlockData || canViewContacts);
      }

      // Fetch contact info via secure RPC function (checks premium/tester status and contact_unlocks)
      if ((canViewContacts || isWorkerUnlocked) && user) {
        const { data: contact, error: contactError } = await supabase
          .rpc('get_worker_contact', { worker_id: id });

        console.log('📞 Tentativa de carregar contato:', { contact, contactError, canViewContacts, isWorkerUnlocked });

        if (contact && contact.length > 0) {
          setContactInfo(contact[0]);
        } else if (contactError) {
          console.log('📞 Acesso ao contato negado:', contactError.message);
        }
      }

      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('*')
        .eq('rated_user_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ratingsData) {
        setRatings(ratingsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar perfil:', error);
      toast({
        title: "Erro ao carregar perfil",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
      setLoading(false);
      navigate('/jobs');
    }
  };

  const handleFreeUnlock = async () => {
    if (!user || !worker) {
      navigate('/auth');
      return;
    }

    if (remainingFreeUnlocks <= 0) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const { error } = await supabase
        .from('contact_unlocks')
        .insert({
          user_id: user.id,
          worker_id: worker.id
        });

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      setIsWorkerUnlocked(true);
      toast({
        title: "Contato desbloqueado",
        description: `Você ainda tem ${remainingFreeUnlocks - 1} desbloqueios gratuitos.`,
      });

      await loadWorkerData();
    } catch (err) {
      console.error('Erro ao desbloquear:', err);
      toast({
        title: "Erro ao desbloquear",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  const handleContactWorker = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para contatar profissionais",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!worker) return;

    try {
      // Check if conversation exists (usando auth.uid() diretamente)
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(contractor_id.eq.${user.id},worker_id.eq.${worker.auth_id}),and(contractor_id.eq.${worker.auth_id},worker_id.eq.${user.id})`)
        .maybeSingle();

      if (existingConv) {
        navigate(`/messages?conversation=${existingConv.id}`);
        return;
      }

      // Create new conversation (usando auth.uid() diretamente)
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          contractor_id: user.id,
          worker_id: worker.auth_id
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      navigate(`/messages?conversation=${newConv.id}`);
      toast({
        title: "Conversa iniciada!",
        description: "Envie uma mensagem para o profissional"
      });
    } catch (err: any) {
      console.error('Erro ao iniciar conversa:', err);
      toast({
        title: "Erro ao iniciar conversa",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p>Carregando...</p>
        </div>
      </>
    );
  }

  if (!worker) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p>Profissional não encontrado</p>
        </div>
      </>
    );
  }

  const initials = worker.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <>
      <Header />
      <div className="min-h-screen bg-muted/30 py-8 pb-20 md:pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Breadcrumbs workerName={worker.name} />

          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0">
                  <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-primary/10">
                    {worker.profile_photo && (
                      <AvatarImage
                        src={worker.profile_photo}
                        alt={worker.name}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-bold leading-tight">{worker.name}</h1>
                        {worker.verified && (
                          <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-lg text-muted-foreground font-medium">
                        {worker.category}
                      </p>
                      {worker.subcategory && (
                        <p className="text-sm text-muted-foreground">{worker.subcategory}</p>
                      )}
                    </div>
                    <FavoriteButton workerId={worker.id} />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {worker.rating_avg > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {worker.rating_avg.toFixed(1)} ({worker.rating_count} avaliações)
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {worker.jobs_done} trabalhos concluídos
                    </Badge>
                    {worker.price && (
                      <Badge variant="outline">{worker.price}</Badge>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {worker.neighborhood ? `${worker.neighborhood}, ` : ''}
                        {worker.city}{worker.state ? ` - ${worker.state}` : ''}
                      </span>
                    </div>

                    {isWorkerUnlocked && contactInfo ? (
                      <>
                        {contactInfo.phone && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{contactInfo.phone}</span>
                            </div>
                          </div>
                        )}
                        {contactInfo.email && (
                          <div className="flex items-center gap-2 mt-2">
                            <Mail className="h-4 w-4" />
                            <span>{contactInfo.email}</span>
                          </div>
                        )}
                      </>
                    ) : !isWorkerUnlocked && (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-5 my-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <Lock className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-bold text-yellow-900 text-lg mb-2">
                              🔒 Contato Bloqueado
                            </p>

                            {remainingFreeUnlocks > 0 ? (
                              <>
                                <p className="text-sm text-yellow-800 mb-3">
                                  Você ainda possui <strong>{remainingFreeUnlocks} {remainingFreeUnlocks === 1 ? 'acesso gratuito' : 'acessos gratuitos'}</strong>.
                                  Desbloqueie agora para ver telefone e WhatsApp!
                                </p>
                                <Button
                                  onClick={handleFreeUnlock}
                                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
                                >
                                  🎁 Desbloquear com Crédito Grátis ({remainingFreeUnlocks}/3)
                                </Button>
                              </>
                            ) : (
                              <>
                                <p className="text-sm text-yellow-800 mb-3">
                                  Você esgotou seus 3 acessos gratuitos. Assine um plano Premium
                                  para desbloquear contatos ilimitados!
                                </p>
                                <Button
                                  onClick={() => setShowUpgradeModal(true)}
                                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                                >
                                  <Crown className="h-4 w-4 mr-2" />
                                  Assinar Premium
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {isWorkerUnlocked && contactInfo?.phone ? (
                      <Button
                        onClick={() => {
                          const cleanPhone = contactInfo.phone.replace(/\D/g, '');
                          const message = encodeURIComponent(
                            `Olá ${worker.name}, vi seu anúncio no Bico Brasil e tenho interesse em conversar.`
                          );
                          window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
                        }}
                        className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Abrir WhatsApp
                      </Button>
                    ) : !isWorkerUnlocked && (
                      <Button
                        onClick={remainingFreeUnlocks > 0 ? handleFreeUnlock : () => setShowUpgradeModal(true)}
                        className="w-full md:w-auto"
                        variant="default"
                      >
                        {remainingFreeUnlocks > 0 ? (
                          <>🎁 Desbloquear Grátis ({remainingFreeUnlocks}/3)</>
                        ) : (
                          <>
                            <Crown className="h-4 w-4 mr-2" />
                            Assinar Premium
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {worker.description && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="font-semibold mb-2">Sobre</h3>
                    <p className="text-muted-foreground">{worker.description}</p>
                  </div>
                </>
              )}

              {worker.availability && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Disponibilidade
                    </h3>
                    <p className="text-muted-foreground">{worker.availability}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {ratings.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <div key={rating.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < rating.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                              }`}
                          />
                        ))}
                      </div>
                      {rating.comment && (
                        <p className="text-sm text-muted-foreground mb-1">{rating.comment}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        remainingViews={remainingFreeViews}
      />

      <Footer />
    </>
  );
}
