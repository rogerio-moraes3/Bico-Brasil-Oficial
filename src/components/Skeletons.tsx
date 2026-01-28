import React from 'react';
import { Card } from '@/components/Card';
import { Skeleton } from '@/components/ui/skeleton';

export function JobCardSkeleton() {
    return (
        <Card>
            <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-10 w-full" />
            </div>
        </Card>
    );
}

export function WorkerCardSkeleton() {
    return (
        <Card>
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-10 w-full" />
            </div>
        </Card>
    );
}
