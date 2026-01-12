import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Navigation } from 'lucide-react';

interface GeolocationSearchProps {
  onLocationChange: (lat: number, lng: number, radius: number) => void;
}

export function GeolocationSearch({ onLocationChange }: GeolocationSearchProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(5);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocalização não suportada",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        onLocationChange(latitude, longitude, radius);
        
        toast({
          title: "Localização obtida!",
          description: `Buscando profissionais em um raio de ${radius}km`
        });
        
        setLoading(false);
      },
      (error) => {
        toast({
          title: "Erro ao obter localização",
          description: "Permita o acesso à sua localização",
          variant: "destructive"
        });
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    if (location) {
      onLocationChange(location.lat, location.lng, radius);
    }
  }, [radius]);

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Buscar por proximidade</h3>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="radius">Raio de busca (km)</Label>
          <Input
            id="radius"
            type="number"
            min="1"
            max="50"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="max-w-xs"
          />
        </div>

        <Button
          onClick={getCurrentLocation}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            'Obtendo localização...'
          ) : (
            <>
              <Navigation className="h-4 w-4 mr-2" />
              Usar minha localização
            </>
          )}
        </Button>

        {location && (
          <p className="text-sm text-muted-foreground">
            Buscando profissionais em um raio de {radius}km da sua localização
          </p>
        )}
      </div>
    </div>
  );
}
