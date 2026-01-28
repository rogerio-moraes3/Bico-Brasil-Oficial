import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
    onFilterChange?: (filters: any) => void;
    className?: string;
}

export function FilterPanel({ onFilterChange, className }: FilterPanelProps) {
    const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
    const [selectedLocation, setSelectedLocation] = React.useState<string>('all');
    const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 1000]);

    const handleApplyFilters = () => {
        onFilterChange?.({
            category: selectedCategory,
            location: selectedLocation,
            priceRange
        });
    };

    const handleResetFilters = () => {
        setSelectedCategory('all');
        setSelectedLocation('all');
        setPriceRange([0, 1000]);
        onFilterChange?.({
            category: 'all',
            location: 'all',
            priceRange: [0, 1000]
        });
    };

    return (
        <Card className={cn('shadow-lg', className)}>
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Filtros</h3>

                <Tabs defaultValue="category" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="category">Categoria</TabsTrigger>
                        <TabsTrigger value="location">Localização</TabsTrigger>
                    </TabsList>

                    <TabsContent value="category" className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Selecione uma categoria para filtrar
                        </p>
                        {/* Category filters would go here */}
                    </TabsContent>

                    <TabsContent value="location" className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Selecione uma localização para filtrar
                        </p>
                        {/* Location filters would go here */}
                    </TabsContent>
                </Tabs>

                <div className="flex gap-2">
                    <Button onClick={handleApplyFilters} className="flex-1">
                        Aplicar
                    </Button>
                    <Button onClick={handleResetFilters} variant="outline">
                        Limpar
                    </Button>
                </div>
            </div>
        </Card>
    );
}
