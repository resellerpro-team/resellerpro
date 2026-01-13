import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AdminLoginForm from '@/components/admin/admin-login-form'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-gray-100 relative overflow-hidden">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-800/40 to-black/60"></div>
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-3xl"></div>

      {/* Login Card */}
      <Card className="w-[400px] border border-white/10 bg-white/[0.05] backdrop-blur-md shadow-2xl rounded-2xl relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-white tracking-wide">
            Admin Login
          </CardTitle>
          <p className="mt-1 text-sm text-gray-400">Access your admin panel securely</p>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
