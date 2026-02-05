import {
  Database,
  ShieldCheck,
  TrendingUp,
  ClipboardPaste,
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  BarChart,
  FileText,
  PieChart,
} from 'lucide-react'

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 overflow-hidden bg-gradient-to-b from-background via-secondary/20 to-background">

      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[300px] h-[300px] bg-secondary/40 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powerful Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              grow your business
            </span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Powerful tools designed specifically for resellers. Manage orders, track customers,
            and scale your business with confidence.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">

          {/* Card 1: Smart Paste - Large Card */}
          <div className="lg:col-span-2 group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-500" />

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Left Content */}
              <div className="flex-1 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
                  <ClipboardPaste className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-foreground">Smart Paste</h3>

                <p className="text-muted-foreground leading-relaxed">
                  Create customers instantly! Simply paste customer details from WhatsApp into the
                  customer create page and our AI automatically extracts all the information.
                  No manual data entry required.
                </p>

                <ul className="space-y-2 pt-2">
                  {['Auto-extract name & phone number', 'Detect location automatically', 'Capture email instantly'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Visual */}
              <div className="w-full lg:w-72 flex-shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-border shadow-lg p-4 space-y-3">
                  {/* Simulated paste input */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-xs text-muted-foreground font-mono">
                    <p className="text-gray-500">Pasted from WhatsApp:</p>
                    <p className="mt-2 text-foreground">"Priya Sharma, 9876543210, Mumbai 400001, priya@gmail.com"</p>
                  </div>

                  {/* Extracted data */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-green-600 font-medium">AI Extracted:</span>
                    </div>
                    {[
                      { label: 'Name', value: 'Priya Sharma' },
                      { label: 'Phone', value: '9876543210' },
                      { label: 'Location', value: 'Mumbai 400001' },
                      { label: 'Email', value: 'priya@gmail.com' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-primary/5 rounded-lg px-3 py-2">
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                        <span className="text-xs font-semibold text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: CRM Database - Vertical Card */}
          <div className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">

            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-3xl -z-10" />

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-5">
              <Database className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-xl font-bold text-foreground mb-3">CRM Database</h3>

            <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
              All your customer data organized in one place. Track order history, preferences, and build lasting relationships.
            </p>

            {/* Mini Stats */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
              <div className="bg-cyan-500/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-cyan-600">10K+</div>
                <div className="text-xs text-muted-foreground">Customers</div>
              </div>
              <div className="bg-blue-500/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">50K+</div>
                <div className="text-xs text-muted-foreground">Orders</div>
              </div>
            </div>
          </div>

          {/* Card 3: Secure by Design */}
          <div className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">

            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/10 to-transparent rounded-full blur-2xl -z-10" />

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 mb-5">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-xl font-bold text-foreground mb-3">Secure by Design</h3>

            <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
              Bank-grade encryption protects your business data. Your customers' information is always safe with us.
            </p>

            {/* Security badges */}
            <div className="flex flex-wrap gap-2 mt-auto">
              {['256-bit SSL', 'GDPR', 'SOC2'].map((badge, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 rounded-full">
                  <Lock className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Analytics & Insights */}
          <div className="md:col-span-2 group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">

            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-indigo-500/10 to-transparent rounded-full blur-3xl -z-10" />

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                <PieChart className="w-7 h-7 text-white" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-3">Real-time Analytics</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Track your business performance with detailed analytics. Know your best products,
                  top customers, and revenue trends at a glance.
                </p>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: BarChart, value: 'Live', label: 'Dashboard', color: 'indigo' },
                    { icon: FileText, value: 'Auto', label: 'Reports', color: 'purple' },
                    { icon: TrendingUp, value: 'Smart', label: 'Insights', color: 'pink' },
                  ].map((metric, i) => (
                    <div key={i} className="text-center p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border border-border/50">
                      <metric.icon className={`w-5 h-5 mx-auto mb-2 ${metric.color === 'indigo' ? 'text-indigo-500' :
                        metric.color === 'purple' ? 'text-purple-500' : 'text-pink-500'
                        }`} />
                      <div className="text-lg font-bold text-foreground">{metric.value}</div>
                      <div className="text-xs text-muted-foreground">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
