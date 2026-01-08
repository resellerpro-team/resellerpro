// import { createClient } from '@/lib/supabase/server'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Users, ShoppingCart, CreditCard, Building } from 'lucide-react'

// export async function DashboardMetrics() {
//   const supabase = await createClient()

//   const [
//     { count: usersCount },
//     { count: ordersCount },
//     { data: revenue },
//     { count: businessCount }
//   ] = await Promise.all([
//     supabase.from('profiles').select('*', { count: 'exact', head: true }),
//     supabase.from('orders').select('*', { count: 'exact', head: true }),
//     supabase.from('orders').select('amount').eq('status', 'completed'),
//     supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'active')
//   ])

//   const totalRevenue = revenue?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0

//   const metrics = [
//     { title: 'Total Customers', value: usersCount || 0, icon: Users },
//     { title: 'Total Orders', value: ordersCount || 0, icon: ShoppingCart },
//     { title: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: CreditCard },
//     { title: 'Active Businesses', value: businessCount || 0, icon: Building }
//   ]

//   return (
//     <>
//       {metrics.map((metric) => (
//         <Card key={metric.title}>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
//             <metric.icon className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{metric.value}</div>
//           </CardContent>
//         </Card>
//       ))}
//     </>
//   )
// }


import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ShoppingCart, CreditCard, Building } from 'lucide-react'

export async function DashboardMetrics() {
  const supabase = await createClient()

  const [
    { count: usersCount },
    { count: ordersCount },
    { data: revenue },
    { count: businessCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('amount').eq('status', 'completed'),
    supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
  ])

  const totalRevenue =
    revenue?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0

  const metrics = [
    {
      title: 'Total Customers',
      value: usersCount || 0,
      icon: Users,
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      title: 'Total Orders',
      value: ordersCount || 0,
      icon: ShoppingCart,
      gradient: 'from-emerald-500 to-teal-400',
    },
    {
      title: 'Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: CreditCard,
      gradient: 'from-amber-400 to-yellow-300',
    },
    {
      title: 'Active Businesses',
      value: businessCount || 0,
      icon: Building,
      gradient: 'from-pink-500 to-rose-400',
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card
          key={metric.title}
          className="border border-white/10 bg-white/[0.03] backdrop-blur-md rounded-2xl shadow-lg hover:border-indigo-500/30 transition-all duration-300"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-300">
              {metric.title}
            </CardTitle>
            <div
              className={`p-2 rounded-xl bg-gradient-to-r ${metric.gradient} bg-clip-padding text-white shadow-sm`}
            >
              <metric.icon className="h-4 w-4" />
            </div>
          </CardHeader>

          <CardContent>
            <div
              className={`text-3xl font-semibold bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`}
            >
              {metric.value}
            </div>
            <p className="text-xs text-gray-500 mt-1">Updated just now</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
