// import { createClient } from '@/lib/supabase/server'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import { Button } from "@/components/ui/button"
// import Link from "next/link"
// import { EyeIcon, PencilIcon } from "lucide-react"

// export async function CustomersTable() {
//   const supabase = await createClient()
  
//   const { data: customers } = await supabase
//     .from('profiles')
//     .select(`
//       *,
//       businesses (
//         id,
//         name,
//         status
//       )
//     `)
//     .order('created_at', { ascending: false })

//   return (
//     <div className="rounded-md border">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Business Name</TableHead>
//             <TableHead>Owner</TableHead>
//             <TableHead>Email</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead className="w-[100px]">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {customers?.map((customer) => (
//             <TableRow key={customer.id}>
//               <TableCell className="font-medium">
//                 {customer.business_name}
//               </TableCell>
//               <TableCell>{customer.full_name}</TableCell>
//               <TableCell>{customer.email}</TableCell>
//               <TableCell>
//                 <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
//                   customer.businesses?.status === 'active' 
//                     ? 'bg-green-100 text-green-700'
//                     : 'bg-gray-100 text-gray-700'
//                 }`}>
//                   {customer.businesses?.status || 'pending'}
//                 </span>
//               </TableCell>
//               <TableCell>
//                 <div className="flex space-x-2">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     asChild
//                   >
//                     <Link href={`/admin/customers/${customer.id}`}>
//                       <EyeIcon className="h-4 w-4" />
//                     </Link>
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                   >
//                     <PencilIcon className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   )
// }

import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { EyeIcon, PencilIcon } from 'lucide-react'

export async function CustomersTable() {
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from('profiles')
    .select(`
      *,
      businesses (
        id,
        name,
        status
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-lg transition-all hover:border-indigo-500/30">
      <Table>
        {/* ===== Table Header ===== */}
        <TableHeader className="bg-white/[0.05] border-b border-white/[0.05]">
          <TableRow>
            <TableHead className="text-gray-300 font-semibold tracking-wide">
              Business Name
            </TableHead>
            <TableHead className="text-gray-300 font-semibold tracking-wide">
              Owner
            </TableHead>
            <TableHead className="text-gray-300 font-semibold tracking-wide">
              Email
            </TableHead>
            <TableHead className="text-gray-300 font-semibold tracking-wide">
              Status
            </TableHead>
            <TableHead className="text-gray-300 font-semibold text-center">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        {/* ===== Table Body ===== */}
        <TableBody>
          {customers?.length ? (
            customers.map((customer) => (
              <TableRow
                key={customer.id}
                className="hover:bg-white/[0.05] transition-all duration-200 border-b border-white/[0.03]"
              >
                <TableCell className="font-medium text-gray-100">
                  {customer.business_name || '—'}
                </TableCell>
                <TableCell className="text-gray-300">
                  {customer.full_name || '—'}
                </TableCell>
                <TableCell className="text-gray-400">
                  {customer.email || '—'}
                </TableCell>

                <TableCell>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      customer.businesses?.status === 'active'
                        ? 'bg-green-500/10 text-green-400 border border-green-400/30'
                        : 'bg-gray-500/10 text-gray-400 border border-gray-400/20'
                    }`}
                  >
                    {customer.businesses?.status || 'pending'}
                  </span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-300 hover:text-indigo-400 hover:bg-white/[0.05] transition-all"
                      asChild
                    >
                      <Link href={`/admin/customers/${customer.id}`}>
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-300 hover:text-blue-400 hover:bg-white/[0.05] transition-all"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-gray-500 italic"
              >
                No customers found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

