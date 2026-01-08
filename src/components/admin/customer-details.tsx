// import { createClient } from '@/lib/supabase/server'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// interface CustomerDetailsProps {
//   id: string
// }

// export async function CustomerDetails({ id }: CustomerDetailsProps) {
//   const supabase = await createClient()
  
//   const { data: profile } = await supabase
//     .from('profiles')
//     .select('*, businesses(*)')
//     .eq('id', id)
//     .single()

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Customer Details</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <h3 className="font-medium">Business Name</h3>
//             <p className="text-sm text-muted-foreground">{profile?.business_name}</p>
//           </div>
//           <div>
//             <h3 className="font-medium">Email</h3>
//             <p className="text-sm text-muted-foreground">{profile?.business_email}</p>
//           </div>
//           <div>
//             <h3 className="font-medium">Phone</h3>
//             <p className="text-sm text-muted-foreground">{profile?.business_phone}</p>
//           </div>
//           <div>
//             <h3 className="font-medium">GSTIN</h3>
//             <p className="text-sm text-muted-foreground">{profile?.gstin}</p>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CustomerDetailsProps {
  id: string
}

export async function CustomerDetails({ id }: CustomerDetailsProps) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, businesses(*)')
    .eq('id', id)
    .single()

  return (
    <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-md rounded-2xl transition-all hover:border-indigo-500/30">
      {/* ===== Header ===== */}
      <CardHeader className="border-b border-white/[0.05] pb-4">
        <CardTitle className="text-lg font-semibold text-gray-100 tracking-wide">
          Customer Details
        </CardTitle>
      </CardHeader>

      {/* ===== Content ===== */}
      <CardContent className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
        <div>
          <h3 className="font-medium text-gray-300">Business Name</h3>
          <p className="text-gray-400 mt-1">
            {profile?.business_name || '—'}
          </p>
        </div>

        <div>
          <h3 className="font-medium text-gray-300">Email</h3>
          <p className="text-gray-400 mt-1">
            {profile?.business_email || '—'}
          </p>
        </div>

        <div>
          <h3 className="font-medium text-gray-300">Phone</h3>
          <p className="text-gray-400 mt-1">
            {profile?.business_phone || '—'}
          </p>
        </div>

        <div>
          <h3 className="font-medium text-gray-300">GSTIN</h3>
          <p className="text-gray-400 mt-1">
            {profile?.gstin || '—'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

