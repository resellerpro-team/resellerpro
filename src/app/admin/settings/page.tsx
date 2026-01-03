import { SettingsForm } from '@/components/admin/settings-form'

export default async function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <header>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Admin Settings
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Configure system preferences and manage admin accounts.
          </p>
        </header>

        {/* Settings Form Section */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm shadow-lg p-6 transition-all hover:border-indigo-500/30">
          <SettingsForm />
        </section>
      </div>
    </div>
  )
}
