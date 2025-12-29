import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface City {
  id: string;
  name: string;
  state: string;
}

export const CitySelector = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");

  useEffect(() => {
    loadCities();
    loadSelectedCity();
  }, []);

  const loadCities = async () => {
    // Aguardar sessão estar pronta antes de fazer query
    const { data: { session } } = await supabase.auth.getSession();

    // Se não tem sessão, não faz query (evita 401)
    if (!session) {
      console.log('[CitySelector] Sem sessão, pulando load de cities');
      return;
    }

    const { data, error } = await supabase
      .from("cities")
      .select("id, name, state")
      .order("name");

    if (error) {
      console.error("Error loading cities:", error);
      return;
    }

    setCities(data || []);
  };

  const loadSelectedCity = () => {
    const saved = localStorage.getItem("selectedCity");
    if (saved) {
      setSelectedCity(saved);
    }
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    localStorage.setItem("selectedCity", cityId);
    window.dispatchEvent(new CustomEvent("cityChanged", { detail: cityId }));
  };

  return (
    <div className="w-full bg-card border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center md:justify-start gap-2 max-w-xs mx-auto md:mx-0">
          <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
          <Select value={selectedCity} onValueChange={handleCityChange} disabled={loading}>
            <SelectTrigger className="h-10 bg-background border border-border">
              <SelectValue placeholder={loading ? "Carregando cidades..." : "Selecione sua cidade"} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {cities
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name} - {city.state}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
