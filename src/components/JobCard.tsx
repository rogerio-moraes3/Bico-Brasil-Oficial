import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobCardProps {
    title: string;
    description?: string;
    location?: string;
    price?: string;
    category?: string;
    createdAt?: string;
    onClick?: () => void;
    className?: string;
}

export function JobCard({
    title,
    description,
    location,
    price,
    category,
    createdAt,
    onClick,
    className
}: JobCardProps) {
    return (
        <Card className={cn('cursor-pointer transition-all hover:shadow-lg', className)} onClick={onClick}>
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
                    {category && (
                        <Badge variant="secondary" className="shrink-0">
                            {category}
                        </Badge>
                    )}
                </div>

                {/* Description */}
                {description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {description}
                    </p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{location}</span>
                        </div>
                    )}
                    {price && (
                        <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{price}</span>
                        </div>
                    )}
                    {createdAt && (
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{createdAt}</span>
                        </div>
                    )}
                </div>

                {/* Action */}
                <Button variant="outline" className="w-full" onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                }}>
                    Ver Detalhes
                </Button>
            </div>
        </Card>
    );
}
