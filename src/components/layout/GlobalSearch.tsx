'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, Package, Users, ShoppingCart, ArrowRight } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SearchResults {
    orders: any[]
    customers: any[]
    products: any[]
}

export function GlobalSearch() {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState('')
    const debouncedQuery = useDebounce(query, 300)
    const [results, setResults] = React.useState<SearchResults>({
        orders: [],
        customers: [],
        products: [],
    })
    const [loading, setLoading] = React.useState(false)
    const router = useRouter()

    const containerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    React.useEffect(() => {
        if (debouncedQuery.length < 2) {
            setResults({ orders: [], customers: [], products: [] })
            setLoading(false)
            return
        }

        const fetchResults = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
                const data = await res.json()
                setResults(data)
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchResults()
    }, [debouncedQuery])

    const handleSelect = (url: string) => {
        setOpen(false)
        setQuery('')
        router.push(url)
    }

    const hasResults =
        results.orders.length > 0 ||
        results.customers.length > 0 ||
        results.products.length > 0

    return (
        <div className="relative w-full max-w-md" ref={containerRef}>
            <div
                className="relative group cursor-text"
                onClick={() => setOpen(true)}
            >
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-hover:text-foreground transition-colors" />
                <div className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm text-muted-foreground ring-offset-background group-hover:border-accent transition-colors items-center truncate">
                    <span className="truncate">Search orders, customers...</span>
                    <kbd className="pointer-events-none absolute right-3 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </div>
            </div>

            <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
                <CommandInput
                    placeholder="Type to search..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    {loading && (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {!loading && query.length >= 2 && !hasResults && (
                        <CommandEmpty>No results found for "{query}".</CommandEmpty>
                    )}

                    {!loading && query.length < 2 && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            Enter at least 2 characters to search...
                        </div>
                    )}

                    {!loading && hasResults && (
                        <>
                            {results.orders.length > 0 && (
                                <CommandGroup heading="Orders">
                                    {results.orders.map((order) => (
                                        <CommandItem
                                            key={order.id}
                                            onSelect={() => handleSelect(`/orders/${order.id}`)}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">#{order.order_number}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {order.customers?.name || 'No Customer'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold">₹{order.total_amount}</span>
                                                <Badge variant="outline" className="capitalize text-[10px] h-5">
                                                    {order.status}
                                                </Badge>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                            {results.customers.length > 0 && (
                                <>
                                    <CommandSeparator />
                                    <CommandGroup heading="Customers">
                                        {results.customers.map((customer) => (
                                            <CommandItem
                                                key={customer.id}
                                                onSelect={() => handleSelect(`/customers/${customer.id}`)}
                                                className="flex items-center gap-3"
                                            >
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">{customer.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {customer.phone ? customer.phone.replace(/(\d{2})(\d{5})(\d{5})/, '+$1 $2*****') : 'No phone'}
                                                    </p>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </>
                            )}

                            {results.products.length > 0 && (
                                <>
                                    <CommandSeparator />
                                    <CommandGroup heading="Products">
                                        {results.products.map((product) => (
                                            <CommandItem
                                                key={product.id}
                                                onSelect={() => handleSelect(`/products/${product.id}`)}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {product.sku || 'No SKU'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-sm font-semibold">₹{product.selling_price}</span>
                                                    <span className={cn(
                                                        "text-[10px]",
                                                        product.stock_quantity <= 5 ? "text-red-500 font-medium" : "text-muted-foreground"
                                                    )}>
                                                        {product.stock_quantity} in stock
                                                    </span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </>
                            )}

                            <div className="p-2 border-t mt-2">
                                <button
                                    onClick={() => handleSelect(`/search?q=${encodeURIComponent(query)}`)}
                                    className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-primary hover:bg-accent rounded-sm transition-colors"
                                >
                                    View all results
                                    <ArrowRight className="h-3 w-3" />
                                </button>
                            </div>
                        </>
                    )}
                </CommandList>
            </CommandDialog>
        </div>
    )
}
