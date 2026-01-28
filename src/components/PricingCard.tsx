import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingCardProps {
    title: string;
    price: string;
    period?: string;
    description?: string;
    features: string[];
    highlighted?: boolean;
    onSelect?: () => void;
    buttonText?: string;
    className?: string;
}

export function PricingCard({
    title,
    price,
    period = '/mês',
    description,
    features,
    highlighted = false,
    onSelect,
    buttonText = 'Selecionar',
    className
}: PricingCardProps) {
    return (
        <Card className={cn(
            'relative transition-all hover:shadow-xl',
            highlighted && 'border-primary border-2 shadow-lg',
            className
        )}>
            {highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Mais Popular
                </Badge>
            )}

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold">{title}</h3>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{price}</span>
                    <span className="text-muted-foreground">{period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                        </li>
                    ))}
                </ul>

                {/* Action */}
                <Button
                    onClick={onSelect}
                    variant={highlighted ? 'default' : 'outline'}
                    className="w-full"
                >
                    {buttonText}
                </Button>
            </div>
        </Card>
    );
}
