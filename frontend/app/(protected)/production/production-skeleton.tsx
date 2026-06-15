import { Skeleton } from "@/components/ui/skeleton";

export function ProductionSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </div>
      
      <Skeleton className="h-[200px] rounded-xl" />
      
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-[300px]" />
      </div>

      <div className="rounded-md border">
        <div className="h-12 border-b bg-muted/50 px-4 flex items-center">
          <Skeleton className="h-4 w-1/4" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 border-b px-4 flex items-center gap-4">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-6 w-[80px] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
