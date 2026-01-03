import { UsageMetrics } from '@/components/admin/usage-metrics'
import { UsageCharts } from '@/components/admin/usage-charts'

export default async function UsagePage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <header>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            System Usage
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Monitor database, storage, and API usage in real time.
          </p>
        </header>

        {/* Usage Metrics Section */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm shadow-lg p-6 transition-all hover:border-indigo-500/30">
          <UsageMetrics />
        </section>

        {/* Charts Section */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm shadow-lg p-6 transition-all hover:border-indigo-500/30">
          <UsageCharts />
        </section>
      </div>
    </div>
  )
}
