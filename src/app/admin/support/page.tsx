import { TicketsTable } from '@/components/admin/tickets-table'

export default async function SupportPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Support Tickets
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              View and manage customer support tickets efficiently.
            </p>
          </div>
        </header>

        {/* Tickets Table Section */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm shadow-lg p-6 transition-all hover:border-indigo-500/30">
          <TicketsTable />
        </section>
      </div>
    </div>
  )
}
