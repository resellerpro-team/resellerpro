import { ArrowRight, Package, TrendingUp, Users, CheckCircle } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 -z-10" />

      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slideInLeft">
            <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full text-sm font-medium text-blue-700">
              <CheckCircle size={16} />
              <span>Trusted by 5000+ resellers worldwide</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Manage Your Reselling Business{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                Like a Pro
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              Track products, manage orders, and grow your customer base with our all-in-one platform. Built for modern resellers who demand excellence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                <span>Start Free Trial</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-all font-semibold border-2 border-gray-200 shadow-sm hover:shadow-md">
                Watch Demo
              </button>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 border-2 border-white" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-white" />
                </div>
                <span className="text-sm text-gray-600 font-medium">Join 5000+ users</span>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
                <span className="text-sm text-gray-600 font-medium ml-2">4.9/5</span>
              </div>
            </div>
          </div>

          <div className="relative animate-slideInRight">
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white">
                <div>
                  <p className="text-sm opacity-90">Total Revenue</p>
                  <p className="text-3xl font-bold">₹24,580</p>
                </div>
                <TrendingUp size={40} className="opacity-80" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="text-blue-600" size={20} />
                    <p className="text-sm font-medium text-gray-700">Products</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">1,245</p>
                  <p className="text-xs text-green-600 font-medium mt-1">+12% this month</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="text-cyan-600" size={20} />
                    <p className="text-sm font-medium text-gray-700">Customers</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">892</p>
                  <p className="text-xs text-green-600 font-medium mt-1">+8% this month</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">Recent Orders</p>
                {[
                  { id: 'ORD-1234', status: 'Delivered', amount: '₹120' },
                  { id: 'ORD-1235', status: 'Processing', amount: '₹85' },
                  { id: 'ORD-1236', status: 'Shipped', amount: '₹240' },
                ].map((order, idx) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm font-medium text-gray-700">{order.id}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-gray-600">{order.status}</span>
                      <span className="text-sm font-bold text-gray-900">{order.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 blur-2xl animate-pulse" />
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full opacity-20 blur-2xl animate-pulse animation-delay-2000" />
          </div>
        </div>
      </div>
    </section>
  );
}
