import { PlansTable } from '@/components/admin/plans-table'
import { Button } from '@/components/ui/button'

export default async function PlansPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Subscription Plans
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Manage and configure customer subscription plans.
            </p>
          </div>

          <Button
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-5 py-2.5 font-medium shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
          >
            Add New Plan
          </Button>
        </div>

        {/* Plans Table */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm shadow-lg p-6 transition-all hover:border-indigo-500/30">
          <PlansTable />
        </section>
      </div>
    </div>
  )
}
