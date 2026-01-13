import {
  ArrowRight,
  Package,
  TrendingUp,
  Users,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 -z-10" />

      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply blur-xl opacity-30 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply blur-xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply blur-xl opacity-30 animate-blob animation-delay-4000" />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT CONTENT */}
          <div className="space-y-8 animate-slideInLeft">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full text-sm font-medium text-blue-700">
              <CheckCircle size={16} />
              <span>Built for WhatsApp-first resellers</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Manage Your Reselling Business{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                Like a Pro
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              Track enquiries, manage orders, and grow your customer base with one
              simple dashboard. Built for modern resellers who sell through WhatsApp.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <button className="group px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                  <span>Get Started Free</span>
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </Link>

              <button className="px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-all font-semibold border-2 border-gray-200 shadow-sm hover:shadow-md">
                Watch Demo
              </button>
            </div>

            {/* Micro trust */}
            <p className="text-sm text-gray-500">
              No credit card required • Free plan available
            </p>
          </div>

          {/* RIGHT CARD */}
          <div className="relative animate-slideInRight">
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 space-y-6">
              {/* Sample label */}
              <p className="text-xs text-gray-400 font-medium">
                Sample dashboard
              </p>

              {/* Revenue */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white">
                <div>
                  <p className="text-sm opacity-90">Total Revenue</p>
                  <p className="text-3xl font-bold">₹24,580</p>
                </div>
                <TrendingUp size={40} className="opacity-80" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="text-blue-600" size={20} />
                    <p className="text-sm font-medium text-gray-700">
                      Products
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">1,245</p>
                  <p className="text-xs text-green-600 font-medium mt-1">
                    +12% this month
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="text-cyan-600" size={20} />
                    <p className="text-sm font-medium text-gray-700">
                      Customers
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">892</p>
                  <p className="text-xs text-green-600 font-medium mt-1">
                    +8% this month
                  </p>
                </div>
              </div>

              {/* Enquiries */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">
                  Recent Enquiries
                </p>

                {[
                  {
                    name: 'Zidan',
                    message: 'Jersey price?',
                    time: '2h ago',
                  },
                  {
                    name: 'Guest 2327',
                    message: 'Bulk order enquiry',
                    time: '5h ago',
                  },
                ].map((enquiry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {enquiry.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {enquiry.message}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {enquiry.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Orders */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">
                  Recent Orders
                </p>

                {[
                  {
                    id: 'ORD-1234',
                    status: 'Delivered',
                    amount: '₹120',
                  },
                  {
                    id: 'ORD-1235',
                    status: 'Processing',
                    amount: '₹85',
                  },
                ].map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {order.id}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-gray-600">
                        {order.status}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {order.amount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Glow */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 blur-2xl animate-pulse" />
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full opacity-20 blur-2xl animate-pulse animation-delay-2000" />
          </div>
        </div>
      </div>
    </section>
  )
}


