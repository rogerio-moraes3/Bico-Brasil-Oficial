import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, MapPin, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
    onSearch?: (query: string) => void;
    placeholder?: string;
    showFilters?: boolean;
    onFilterClick?: () => void;
    className?: string;
}

export function SearchBar({
    onSearch,
    placeholder = 'Buscar...',
    showFilters = false,
    onFilterClick,
    className
}: SearchBarProps) {
    const [query, setQuery] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch?.(query);
    };

    return (
        <Card className={cn('shadow-lg', className)}>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {showFilters && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onFilterClick}
                    >
                        <Filter className="h-4 w-4" />
                    </Button>
                )}
                <Button type="submit">
                    Buscar
                </Button>
            </form>
        </Card>
    );
}
