import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type City = { id: string; name: string; state?: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  cities: City[];
  includeAll?: boolean;
  placeholder?: string;
};

import { MapPin } from 'lucide-react';

export default function CitySelect({ value, onChange, cities, includeAll = true, placeholder = 'Selecione a cidade' }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v)}>
      <SelectTrigger className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAll && <SelectItem value="all">Todas as cidades</SelectItem>}
        {cities.map((city) => (
          <SelectItem key={city.id} value={String(city.id)}>
            {city.name}{city.state ? ` - ${city.state}` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
