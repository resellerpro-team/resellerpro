import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function DashboardMetrics() {
  const metrics = [
    { title: 'Users', value: '1,234', color: 'from-indigo-500 to-blue-500' },
    { title: 'Orders', value: '567', color: 'from-emerald-500 to-teal-400' },
    { title: 'Revenue', value: '₹12,345', color: 'from-amber-500 to-yellow-400' },
    { title: 'Active', value: '89%', color: 'from-pink-500 to-rose-400' },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, i) => (
        <Card
          key={i}
          className="border border-white/10 bg-white/[0.03] backdrop-blur-md rounded-2xl shadow-lg hover:border-indigo-500/30 transition-all duration-300"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-200 text-base font-medium tracking-wide">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-3xl font-semibold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}
            >
              {metric.value}
            </p>
            <p className="mt-1 text-sm text-gray-500">Updated just now</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Overview of key business metrics and performance.
          </p>
        </header>

        {/* Metrics Section */}
        <section>
          <DashboardMetrics />
        </section>
      </div>
    </div>
  )
}
