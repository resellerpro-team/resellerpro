import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function EnquiriesSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-card rounded-lg border">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <div className="ml-4 flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded" />
            <Skeleton className="h-9 w-9 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
