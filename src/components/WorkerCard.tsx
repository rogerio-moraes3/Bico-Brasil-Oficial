import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Star, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkerCardProps {
    name: string;
    avatar?: string;
    bio?: string;
    location?: string;
    rating?: number;
    skills?: string[];
    onClick?: () => void;
    className?: string;
}

export function WorkerCard({
    name,
    avatar,
    bio,
    location,
    rating,
    skills = [],
    onClick,
    className
}: WorkerCardProps) {
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <Card className={cn('cursor-pointer transition-all hover:shadow-lg', className)} onClick={onClick}>
            <div className="space-y-4">
                {/* Header with Avatar */}
                <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={avatar} alt={name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{name}</h3>
                        {location && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{location}</span>
                            </div>
                        )}
                    </div>
                    {rating && (
                        <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Bio */}
                {bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {bio}
                    </p>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                            </Badge>
                        ))}
                        {skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{skills.length - 3}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Action */}
                <Button variant="outline" className="w-full" onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                }}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    Ver Perfil
                </Button>
            </div>
        </Card>
    );
}
