import { CustomerDetails } from '@/components/admin/customer-details'
import { CustomerActivity } from '@/components/admin/customer-activity'

export default async function CustomerPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Customer Details
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              View customer profile, history, and activity overview.
            </p>
          </div>
        </header>

        {/* Details Section */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm shadow-lg p-6 transition-all hover:border-indigo-500/30">
          <CustomerDetails id={params.id} />
        </section>

        {/* Activity Section */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm shadow-lg p-6 transition-all hover:border-indigo-500/30">
          <CustomerActivity id={params.id} />
        </section>
      </div>
    </div>
  )
}
