import { CustomersTable } from '@/components/admin/customers-table'

export default async function CustomersPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Customers
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Manage and view your customer list in real time.
            </p>
          </div>

          {/* Example action button (optional) */}
          <button className="hidden md:inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-indigo-500 transition-all">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Customer
          </button>
        </header>

        {/* Content Section */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 shadow-lg">
          <CustomersTable />
        </section>
      </div>
    </div>
  )
}
