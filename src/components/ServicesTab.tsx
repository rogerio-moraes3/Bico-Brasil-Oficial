import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  category: string;
  subcategory: string | null;
  service_title: string;
  service_description: string | null;
}

interface ServicesTabProps {
  onSelectService: (service: Service) => void;
}

export const ServicesTab = ({ onSelectService }: ServicesTabProps) => {
  const [data, setData] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data: servicesData, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true })
        .order('subcategory', { ascending: true })
        .order('service_title', { ascending: true });

      if (error) throw error;

      setData(servicesData || []);
      if (servicesData && servicesData.length > 0) {
        const firstCategory = servicesData[0].category;
        setSelectedCategory(firstCategory);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar serviços",
        description: "Não foi possível carregar os serviços. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCategory) return;
    const subcategories = [...new Set(
      data
        .filter(d => d.category === selectedCategory)
        .map(r => r.subcategory || "Geral")
    )];
    setSelectedSubcategory(subcategories[0] || null);
  }, [selectedCategory, data]);

  useEffect(() => {
    if (!selectedCategory || !selectedSubcategory) return;
    const filteredServices = data.filter(
      r => r.category === selectedCategory && 
           (r.subcategory || "Geral") === selectedSubcategory
    );
    setServices(filteredServices);
  }, [selectedCategory, selectedSubcategory, data]);

  const categories = [...new Set(data.map(r => r.category))];
  const subcategories = selectedCategory 
    ? [...new Set(data.filter(d => d.category === selectedCategory).map(r => r.subcategory || "Geral"))]
    : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary" />
        <span className="text-sm text-muted-foreground">Carregando serviços…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-2xl font-bold mb-4">Selecione a Categoria</h2>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <Button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedSubcategory(null);
              }}
              variant={cat === selectedCategory ? "default" : "outline"}
              className="transition-all"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {selectedCategory && (
        <div>
          <h3 className="text-xl font-semibold mb-3">Subcategoria</h3>
          <div className="flex gap-2 flex-wrap">
            {subcategories.map(sub => (
              <Button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                variant={sub === selectedSubcategory ? "default" : "outline"}
                size="sm"
              >
                {sub}
              </Button>
            ))}
          </div>
        </div>
      )}

      {services.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-3">Serviços Disponíveis</h3>
          <div className="grid gap-3">
            {services.map(service => (
              <Card key={service.id} className="p-4 hover:shadow-[0_0_20px_hsl(var(--xp-primary-glow))] transition-all duration-200">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{service.service_title}</h4>
                    {service.service_description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.service_description}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => onSelectService(service)}
                    size="sm"
                  >
                    Selecionar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
