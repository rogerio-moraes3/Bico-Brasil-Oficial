import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonGridProps {
  count?: number;
  columnsClassName?: string;
  className?: string;
}

export const SkeletonGrid = ({ count = 6, columnsClassName, className }: SkeletonGridProps) => {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", columnsClassName, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="rounded-2xl border border-border">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full rounded-xl" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
