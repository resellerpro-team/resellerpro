import { Button } from "@/components/ui/button"
import { FilterX, Search, Package } from "lucide-react"
import Link from "next/link"
import { RequireVerification } from "./RequireVerification"

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  requireVerification?: boolean
}

export function EmptyState({
  icon: Icon = Package,
  title,
  description,
  action,
  secondaryAction,
  requireVerification = false
}: EmptyStateProps) {
  const ActionButton = action?.href ? (
    <Button asChild>
      <Link href={action.href}>{action.label}</Link>
    </Button>
  ) : action?.onClick ? (
    <Button onClick={action.onClick}>{action.label}</Button>
  ) : null

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted/50 p-6 mb-4">
        <Icon className="h-12 w-12 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">{description}</p>

      {action && (
        <div className="flex items-center gap-3">
          {requireVerification ? (
            <RequireVerification>
              {ActionButton}
            </RequireVerification>
          ) : (
            ActionButton
          )}

          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Specific empty state for filtered results
export function FilteredEmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <EmptyState
      icon={FilterX}
      title="No results found"
      description="Try adjusting your filters or search terms to find what you're looking for."
      secondaryAction={{
        label: "Clear all filters",
        onClick: onClearFilters
      }}
    />
  )
}

// Specific empty state for search
export function SearchEmptyState({ searchTerm, onClear }: { searchTerm: string; onClear: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title={`No results for "${searchTerm}"`}
      description="We couldn't find any items matching your search. Try different keywords or check for typos."
      secondaryAction={{
        label: "Clear search",
        onClick: onClear
      }}
    />
  )
}