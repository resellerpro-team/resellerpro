import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Plus, Search, Filter, Users, TrendingUp, DollarSign, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { getCustomers } from './action'
import CustomerCard from '@/components/customers/CustomerCard'

export const metadata = {
  title: 'Customers - ResellerPro',
  description: 'Manage your customers',
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const { customers, stats } = await getCustomers(params.search)

  // Calculate additional stats
  const repeatCustomers = customers.filter((c) => (c.total_orders ?? 0) > 1).length
  const retentionRate = customers.length > 0 ? ((repeatCustomers / customers.length) * 100).toFixed(0) : 0
  const newThisMonth = customers.filter((c) => {
    if (!c.created_at) return false
    const createdDate = new Date(c.created_at)
    const now = new Date()
    return (
      createdDate.getMonth() === now.getMonth() &&
      createdDate.getFullYear() === now.getFullYear()
    )
  }).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer relationships</p>
        </div>
        <Button asChild>
          <Link href="/customers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">+{newThisMonth} new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Repeat Customers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repeatCustomers}</div>
            <p className="text-xs text-muted-foreground">{retentionRate}% retention rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Avg. Customer Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.total > 0 ? Math.round(stats.totalSpent / stats.total).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime value</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <form className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search customers by name or phone..."
            className="pl-10"
            defaultValue={params.search}
          />
        </div>
        <Button variant="outline" type="submit">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </form>

      {/* Customers Grid */}
      {customers.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-3">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">No customers found</h3>
            <p className="text-muted-foreground">
              {params.search
                ? 'Try adjusting your search'
                : 'Get started by adding your first customer'}
            </p>
            {!params.search && (
              <Button asChild>
                <Link href="/customers/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Customer
                </Link>
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              id={customer.id}
              name={customer.name}
              phone={customer.phone}
              email={customer.email || 'N/A'}
              orders={customer.total_orders ?? 0}
              totalSpent={customer.total_spent ?? 0}
              lastOrder={customer.last_order_date}
            />
          ))}
        </div>
      )}
    </div>
  )
}

