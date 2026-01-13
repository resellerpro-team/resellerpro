'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrdersTable } from '@/components/orders/OrderTable'
import CustomerCard from '@/components/customers/CustomerCard'
import { ProductCard } from '@/components/products/ProductCard'
import { Search, Loader2, Package, Users, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'

function SearchResults() {
    const searchParams = useSearchParams()
    const initialQuery = searchParams.get('q') || ''
    const [query, setQuery] = useState(initialQuery)
    const [activeTab, setActiveTab] = useState('all')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState({
        orders: [],
        customers: [],
        products: [],
    })

    useEffect(() => {
        if (!initialQuery) return

        const fetchAllResults = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(initialQuery)}&limit=20`)
                const data = await res.json()
                setResults(data)
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAllResults()
    }, [initialQuery])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            window.history.pushState(null, '', `/search?q=${encodeURIComponent(query)}`)
            // Trigger fetch manually or via useEffect dependency if we use a state for the fetch trigger
        }
    }

    // Update initial query when searchParams change
    useEffect(() => {
        setQuery(searchParams.get('q') || '')
    }, [searchParams])

    const totalResults = results.orders.length + results.customers.length + results.products.length

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-6">Search Results</h1>
                <form onSubmit={handleSearch} className="relative max-w-2xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10 h-12 text-lg"
                        placeholder="Search orders, customers, products..."
                    />
                    <Button type="submit" className="absolute right-1.5 top-1.5 h-9">
                        Search
                    </Button>
                </form>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Searching across your business...</p>
                </div>
            ) : (
                <>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="orders">Orders</TabsTrigger>
                            <TabsTrigger value="customers">Customers</TabsTrigger>
                            <TabsTrigger value="products">Products</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-10">
                            {results.orders.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <ShoppingCart className="h-5 w-5 text-primary" />
                                        <h2 className="text-xl font-semibold">Orders ({results.orders.length})</h2>
                                    </div>
                                    <OrdersTable orders={results.orders} />
                                </section>
                            )}

                            {results.customers.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Users className="h-5 w-5 text-primary" />
                                        <h2 className="text-xl font-semibold">Customers ({results.customers.length})</h2>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {results.customers.map((c: any) => (
                                            <CustomerCard
                                                key={c.id}
                                                id={c.id}
                                                name={c.name}
                                                phone={c.phone || 'N/A'}
                                                email={c.email || 'N/A'}
                                                orders={c.total_orders ?? 0}
                                                totalSpent={c.total_spent ?? 0}
                                                lastOrder={c.last_order_date}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {results.products.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Package className="h-5 w-5 text-primary" />
                                        <h2 className="text-xl font-semibold">Products ({results.products.length})</h2>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {results.products.map((p: any) => (
                                            <ProductCard key={p.id} product={p} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {totalResults === 0 && (
                                <div className="text-center py-20 border rounded-lg bg-muted/20">
                                    <p className="text-lg text-muted-foreground font-medium">No results found for "{initialQuery}"</p>
                                    <p className="text-sm text-muted-foreground mt-1">Try different keywords or check for typos.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="orders">
                            {results.orders.length > 0 ? (
                                <OrdersTable orders={results.orders} />
                            ) : (
                                <p className="text-center py-10 text-muted-foreground">No orders found.</p>
                            )}
                        </TabsContent>

                        <TabsContent value="customers">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {results.customers.length > 0 ? (
                                    results.customers.map((c: any) => (
                                        <CustomerCard
                                            key={c.id}
                                            id={c.id}
                                            name={c.name}
                                            phone={c.phone || 'N/A'}
                                            email={c.email || 'N/A'}
                                            orders={c.total_orders ?? 0}
                                            totalSpent={c.total_spent ?? 0}
                                            lastOrder={c.last_order_date}
                                        />
                                    ))
                                ) : (
                                    <p className="text-center py-10 text-muted-foreground col-span-full">No customers found.</p>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="products">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {results.products.length > 0 ? (
                                    results.products.map((p: any) => (
                                        <ProductCard key={p.id} product={p} />
                                    ))
                                ) : (
                                    <p className="text-center py-10 text-muted-foreground col-span-full">No products found.</p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <SearchResults />
        </Suspense>
    )
}
