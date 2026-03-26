import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCities } from "@/hooks/useCities";
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

/**
 * CitySelector - Helper/Visual Component Only
 * 
 * This component provides a global city context indicator in the header.
 * It does NOT control page-level filters.
 * 
 * Each page manages its own city filter using the CitySelect component.
 * This component is for user convenience and visual context only.
 * 
 * The cityChanged event is dispatched for backward compatibility but
 * should not be relied upon for new implementations.
 */
export const CitySelector = () => {
  const { cities, loading } = useCities();
  const [selectedCity, setSelectedCity] = useState<string>("");

  useEffect(() => {
    // Only read persisted city for display (do not write or dispatch events). Helper-only.
    const saved = localStorage.getItem("selectedCity");
    if (saved) setSelectedCity(saved);
  }, []);

  const handleCityChange = (cityId: string) => {
    // Update visual selection only. This component is helper-only and MUST NOT cause global side-effects.
    setSelectedCity(cityId);
  };

  return (
    <div className="w-full bg-[#f8fafc] dark:bg-card border-b border-[rgba(15,23,42,0.06)] dark:border-border/40">
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
