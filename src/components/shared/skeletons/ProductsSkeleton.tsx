import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductsSkeleton({ view = "grid" }: { view?: "grid" | "list" }) {
  if (view === "grid") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
          <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-24 hidden sm:block" />
          <Skeleton className="h-6 w-20 hidden md:block" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  )
}
