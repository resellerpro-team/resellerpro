import { Mail, Phone, Plus } from "lucide-react"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Button } from "../ui/button"
import Link from "next/link"
import { RequireVerification } from "../shared/RequireVerification"

const CustomerCard = ({
  id,
  name,
  phone,
  email,
  orders,
  totalSpent,
  lastOrder,
}: {
  id: string
  name: string
  phone: string
  email: string
  orders: number
  totalSpent: number
  lastOrder: string | null
}) => {
  // Determine customer type based on orders and spending
  const getCustomerType = (): 'vip' | 'active' | 'inactive' => {
    if (orders >= 10 || totalSpent >= 15000) return 'vip'
    if (orders >= 2 || totalSpent >= 3000) return 'active'
    return 'inactive'
  }

  const type = getCustomerType()

  const typeConfig = {
    vip: { label: 'VIP', color: 'bg-purple-500' },
    active: { label: 'Active', color: 'bg-green-500' },
    inactive: { label: 'Inactive', color: 'bg-gray-400' },
  }

  // Format last order date
  const formatLastOrder = (date: string | null): string => {
    if (!date) return 'No orders yet'

    const lastOrderDate = new Date(date)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - lastOrderDate.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
    return lastOrderDate.toLocaleDateString()
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{name}</h3>
              <p className="text-xs text-muted-foreground">{formatLastOrder(lastOrder)}</p>
            </div>
          </div>
          <Badge className={`${typeConfig[type].color} text-white border-0`}>
            {typeConfig[type].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{email}</span>
          </div>
        </div>

        <div className="pt-3 border-t grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Orders</p>
            <p className="text-lg font-bold">{orders}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Spent</p>
            <p className="text-lg font-bold text-green-600">₹{totalSpent.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1" asChild>
            <Link href={`/customers/${id}`}>View Details</Link>
          </Button>
          <RequireVerification>
            <Button size="sm" className="flex-1" asChild>
              <Link href={`/orders/new?customerId=${id}`}>
                <Plus className="mr-1 h-3 w-3" />
                New Order
              </Link>
            </Button>
          </RequireVerification>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerCard