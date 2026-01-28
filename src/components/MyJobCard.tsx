import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, DollarSign, User, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MyJobCardProps {
    title: string;
    description?: string;
    location?: string;
    price?: string;
    status?: 'active' | 'pending' | 'completed' | 'cancelled';
    applicants?: number;
    createdAt?: string;
    onEdit?: () => void;
    onDelete?: () => void;
    onClick?: () => void;
    className?: string;
}

const statusConfig = {
    active: { label: 'Ativo', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    completed: { label: 'Concluído', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' }
};

export function MyJobCard({
    title,
    description,
    location,
    price,
    status = 'active',
    applicants = 0,
    createdAt,
    onEdit,
    onDelete,
    onClick,
    className
}: MyJobCardProps) {
    const statusInfo = statusConfig[status];

    return (
        <Card className={cn('transition-all hover:shadow-lg', className)}>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
                        {description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                    <Badge className={statusInfo.color}>
                        {statusInfo.label}
                    </Badge>
                </div>

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
                    {applicants > 0 && (
                        <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{applicants} candidato{applicants !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                    {createdAt && (
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{createdAt}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {onClick && (
                        <Button variant="outline" className="flex-1" onClick={onClick}>
                            Ver Detalhes
                        </Button>
                    )}
                    {onEdit && (
                        <Button variant="outline" size="icon" onClick={onEdit}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button variant="outline" size="icon" onClick={onDelete} className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}
