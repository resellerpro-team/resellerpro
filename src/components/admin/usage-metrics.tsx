// import { createClient } from '@/lib/supabase/server'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// export async function UsageMetrics() {
//   const supabase = await createClient()

//   const [
//     { data: dbSize },
//     { data: storageUsage },
//     { data: apiRequests },
//     { data: totalRows }
//   ] = await Promise.all([
//     supabase.rpc('get_database_size'),
//     supabase.rpc('get_storage_usage'),
//     supabase.rpc('get_api_requests'),
//     supabase.rpc('get_total_rows', { table_name: 'orders' })
//   ])

//   const metrics = [
//     { title: 'Database Size', value: `${dbSize || 0} MB` },
//     { title: 'Storage Usage', value: `${storageUsage || 0} GB` },
//     { title: 'API Requests', value: apiRequests || 0 },
//     { title: 'Total Rows (Orders)', value: totalRows || 0 }
//   ]

//   return (
//     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//       {metrics.map((metric) => (
//         <Card key={metric.title}>
//           <CardHeader>
//             <CardTitle>{metric.title}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{metric.value}</div>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   )
// }

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, HardDrive, Activity, Table } from 'lucide-react'

export async function UsageMetrics() {
  const supabase = await createClient()

  const [
    { data: dbSize },
    { data: storageUsage },
    { data: apiRequests },
    { data: totalRows },
  ] = await Promise.all([
    supabase.rpc('get_database_size'),
    supabase.rpc('get_storage_usage'),
    supabase.rpc('get_api_requests'),
    supabase.rpc('get_total_rows', { table_name: 'orders' }),
  ])

  const metrics = [
    {
      title: 'Database Size',
      value: `${dbSize || 0} MB`,
      icon: Database,
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      title: 'Storage Usage',
      value: `${storageUsage || 0} GB`,
      icon: HardDrive,
      gradient: 'from-emerald-500 to-teal-400',
    },
    {
      title: 'API Requests',
      value: apiRequests || 0,
      icon: Activity,
      gradient: 'from-amber-400 to-yellow-300',
    },
    {
      title: 'Total Rows (Orders)',
      value: totalRows || 0,
      icon: Table,
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
          {/* ===== Header ===== */}
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

          {/* ===== Content ===== */}
          <CardContent>
            <div
              className={`text-3xl font-semibold bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`}
            >
              {metric.value}
            </div>
            <p className="text-xs text-gray-500 mt-1">Updated moments ago</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

