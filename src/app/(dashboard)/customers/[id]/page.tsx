import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, MessageSquare, Phone, DollarSign, ShoppingCart, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { notFound } from 'next/navigation'
import { getCustomer, getCustomerOrders } from '../action'

export default async function CustomerDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const customer = await getCustomer(id)
  const orders = await getCustomerOrders(id)

  if (!customer) {
    notFound()
  }

  // Determine customer type
  const getCustomerType = (): { label: string; color: string } => {
    const totalOrders = customer.total_orders ?? 0
    const totalSpent = customer.total_spent ?? 0
    
    if (totalOrders >= 10 || totalSpent >= 15000) {
      return { label: 'VIP', color: 'bg-purple-500' }
    }
    if (totalOrders >= 2 || totalSpent >= 3000) {
      return { label: 'Active', color: 'bg-green-500' }
    }
    return { label: 'New', color: 'bg-gray-400' }
  }

  const customerType = getCustomerType()

  // Generate initials
  const initials = customer.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Format full address
  const fullAddress = [
    customer.address_line1,
    customer.address_line2,
    customer.city,
    customer.state,
    customer.pincode,
  ]
    .filter(Boolean)
    .join(', ')

  // WhatsApp link
  const whatsappNumber = customer.whatsapp || customer.phone
  const whatsappLink = `https://wa.me/91${whatsappNumber}?text=Hi ${customer.name}`

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
              <p className="text-muted-foreground">
                Member since {new Date(customer.created_at).toLocaleDateString('en-IN', { 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/customers/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{customer.total_orders ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {customer.last_order_date 
                ? `Last order: ${new Date(customer.last_order_date).toLocaleDateString('en-IN')}`
                : 'No orders yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ₹{(customer.total_spent ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: ₹{customer.total_orders && customer.total_orders > 0 
                ? Math.round((customer.total_spent ?? 0) / customer.total_orders).toLocaleString()
                : 0} per order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Badge className={`${customerType.color} text-white border-0`}>
                {customerType.label}
              </Badge>
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">
              {customerType.label === 'VIP' && 'Valued Customer'}
              {customerType.label === 'Active' && 'Regular Customer'}
              {customerType.label === 'New' && 'New Customer'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p className="text-muted-foreground">Phone</p>
            </div>
            <p className="font-medium">{customer.phone}</p>
          </div>

          {customer.whatsapp && customer.whatsapp !== customer.phone && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <p className="text-muted-foreground">WhatsApp</p>
              </div>
              <p className="font-medium">{customer.whatsapp}</p>
            </div>
          )}

          {customer.email && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-muted-foreground">Email</p>
              </div>
              <p className="font-medium">{customer.email}</p>
            </div>
          )}

          {fullAddress && (
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <p className="text-muted-foreground">Address</p>
              </div>
              <p className="font-medium text-right max-w-xs">{fullAddress}</p>
            </div>
          )}

          {customer.notes && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Notes:</p>
              <p className="text-sm">{customer.notes}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" className="flex-1" asChild>
              <a href={`tel:${customer.phone}`}>
                <Phone className="mr-2 h-4 w-4" />
                Call
              </a>
            </Button>
            <Button className="flex-1" asChild>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message on WhatsApp
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Order History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Order History</CardTitle>
            <CardDescription>Recent orders from this customer</CardDescription>
          </div>
          <Button asChild>
            <Link href={`/orders/new?customer=${id}`}>New Order</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No orders yet</p>
              <Button className="mt-4" asChild>
                <Link href={`/orders/new?customer=${id}`}>Create First Order</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div 
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Order #{order.order_number}</p>
                      <Badge variant={
                        order.status === 'delivered' ? 'default' :
                        order.status === 'cancelled' ? 'destructive' :
                        'secondary'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₹{order.total_amount.toLocaleString()}</p>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/orders/${order.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              ))}
              {orders.length >= 10 && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/orders?customer=${id}`}>View All Orders</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}