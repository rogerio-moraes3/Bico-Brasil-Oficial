import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import logo from "@/assets/logo.png";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, MapPin, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAccessControl } from '@/hooks/useAccessControl';
import { useCities } from '@/hooks/useCities';
import CitySelect from '@/components/CitySelect';
import { Label } from '@/components/ui/label';
import { EmptyState } from "@/components/EmptyState";
import { SkeletonGrid } from "@/components/SkeletonGrid";
import { WhatsAppContactButton } from '@/components/WhatsAppContactButton';
import { UpgradeModal } from '@/components/UpgradeModal';

interface Worker {
  id: string;
  name: string;
  category: string | null;
  neighborhood: string | null;
  rating_avg: number;
  rating_count: number;
  price: string | null;
  profile_photo: string | null;
  plan_active: boolean;
  city: string | null;
  state: string | null;
}

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [neighborhood, setNeighborhood] = useState("");
  const [otherService, setOtherService] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const { toast } = useToast();
  const { canViewContacts, remainingFreeUnlocks } = useAccessControl();
  const { cities, loading: citiesLoading } = useCities();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  // Manual search only: users must click the search button (magnifying glass) to run queries. Removed auto-trigger on city selection.

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };



  const loadWorkers = async (cityId: string) => {
    if (!cityId) return;

    setLoading(true);
    setIsSearching(true);

    try {
      // users_public é uma view segura (nunca expõe cpf/email/phone/address) —
      // consultar public.users diretamente aqui não funciona para usuários
      // comuns, já que o RLS da tabela só libera SELECT para dono-da-linha,
      // admin ou service_role. O telefone só é obtido no momento do
      // desbloqueio, via WhatsAppContactButton (get_worker_contact RPC).
      let query = supabase
        .from('users_public')
        .select('id, name, category, neighborhood, rating_avg, rating_count, price, profile_photo, plan_active, city, state, city_id, description')
        .eq('type', 'worker')
        .eq('plan_active', true)
        .eq('city_id', cityId)
        .not('category', 'is', null)
        .not('neighborhood', 'is', null);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,neighborhood.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedCategory && selectedCategory !== 'all') {
        const selectedCat = categories.find(c => c.slug === selectedCategory);
        if (selectedCat) {
          query = query.eq('category', selectedCat.name);
        }
      }

      if (neighborhood) {
        query = query.ilike('neighborhood', `%${neighborhood}%`);
      }

      const { data, error } = await query.order('rating_avg', { ascending: false }).limit(30);

      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      console.error('Error loading workers:', error);
      toast({
        title: "Erro ao carregar profissionais",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    if (selectedCityId) {
      loadWorkers(selectedCityId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0 animate-fade-in">
      <Header />


      <main id="main-content" className="flex-grow container mx-auto px-4 py-8 overflow-y-auto">
        <Breadcrumbs />
        <div className="mb-8 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Buscar Profissionais</h1>
          <p className="text-lg text-muted-foreground">
            Encontre trabalhadores qualificados na sua cidade
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm mb-8">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Input
                  placeholder="Nome, profissão, bairro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-12"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cidade</Label>
              <CitySelect
                value={selectedCityId}
                onChange={(value) => setSelectedCityId(value)}
                cities={cities}
                includeAll={false}
                placeholder="Selecione sua cidade"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Bairro</label>
              <Input
                placeholder="Todos os bairros"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Outro serviço? Descreva aqui:
            </label>
            <Textarea
              placeholder="Descreva o serviço que você procura..."
              value={otherService}
              onChange={(e) => setOtherService(e.target.value)}
              className="min-h-20"
            />
          </div>
        </div>

        <FloatingActionButton />

        {/* Results */}
        {loading ? (
          <SkeletonGrid count={6} columnsClassName="md:grid-cols-2 lg:grid-cols-3" />
        ) : workers.length === 0 ? (
          <EmptyState
            icon={<MapPin className="h-16 w-16 text-muted-foreground" />}
            title="Nenhum profissional encontrado"
            description={
              selectedCityId
                ? "Nenhum profissional encontrado nesta cidade."
                : "Selecione uma cidade para ver os profissionais."
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker, index) => (
              <Card
                key={worker.id}
                className="hover:shadow-[0_0_20px_hsl(var(--xp-primary-glow))] transition-all cursor-pointer stagger-fade max-w-sm w-full mx-auto rounded-2xl border border-border"
                style={{ ['--stagger-delay' as any]: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-1 flex items-center gap-2">
                        {worker.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {worker.category}
                      </p>
                    </div>
                    {worker.plan_active && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        ✓ Plano Pro
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {worker.neighborhood}, {worker.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 font-semibold">
                          {worker.rating_avg?.toFixed(1) || '0.0'}
                        </span>
                        <span className="ml-1 text-sm text-muted-foreground">
                          ({worker.rating_count || 0} avaliações)
                        </span>
                      </div>
                    </div>

                    {worker.price && (
                      <div className="pt-3 border-t">
                        <p className="text-lg font-bold text-primary mb-3">{worker.price}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter onClick={(e) => e.stopPropagation()}>
                  <WhatsAppContactButton
                    workerId={worker.id}
                    workerName={worker.name}
                    canViewContact={canViewContacts}
                    remainingViews={remainingFreeUnlocks}
                    onUpgradeClick={() => setShowUpgradeModal(true)}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        )
        }

      </main >

      <Footer />

      {showUpgradeModal && (
        <UpgradeModal
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
          remainingViews={remainingFreeUnlocks}
        />
      )}
    </div >
  );
};

export default Jobs;
