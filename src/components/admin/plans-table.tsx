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
// import { Switch } from "@/components/ui/switch"
// import { PencilIcon, TrashIcon } from "lucide-react"

// export async function PlansTable() {
//   const supabase = await createClient()
  
//   const { data: plans } = await supabase
//     .from('plans')
//     .select('*')
//     .order('price', { ascending: true })

//   return (
//     <div className="rounded-md border">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Name</TableHead>
//             <TableHead>Price</TableHead>
//             <TableHead>Storage</TableHead>
//             <TableHead>Features</TableHead>
//             <TableHead>Active</TableHead>
//             <TableHead className="w-[100px]">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {plans?.map((plan) => (
//             <TableRow key={plan.id}>
//               <TableCell className="font-medium">{plan.name}</TableCell>
//               <TableCell>₹{plan.price}/mo</TableCell>
//               <TableCell>{plan.storage}GB</TableCell>
//               <TableCell>
//                 {plan.features?.map((feature: string) => (
//                   <span 
//                     key={feature}
//                     className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700 mr-1"
//                   >
//                     {feature}
//                   </span>
//                 ))}
//               </TableCell>
//               <TableCell>
//                 <Switch checked={plan.active} />
//               </TableCell>
//               <TableCell>
//                 <div className="flex space-x-2">
//                   <Button variant="ghost" size="icon">
//                     <PencilIcon className="h-4 w-4" />
//                   </Button>
//                   <Button variant="ghost" size="icon">
//                     <TrashIcon className="h-4 w-4" />
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
import { Switch } from '@/components/ui/switch'
import { PencilIcon, TrashIcon } from 'lucide-react'

export async function PlansTable() {
  const supabase = await createClient()

  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .order('price', { ascending: true })

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-lg transition-all hover:border-indigo-500/30">
      <Table>
        {/* ===== Header ===== */}
        <TableHeader className="bg-white/[0.05] border-b border-white/[0.05]">
          <TableRow>
            <TableHead className="text-gray-300 font-semibold tracking-wide">
              Name
            </TableHead>
            <TableHead className="text-gray-300 font-semibold tracking-wide">
              Price
            </TableHead>
            <TableHead className="text-gray-300 font-semibold tracking-wide">
              Storage
            </TableHead>
            <TableHead className="text-gray-300 font-semibold tracking-wide">
              Features
            </TableHead>
            <TableHead className="text-gray-300 font-semibold tracking-wide text-center">
              Active
            </TableHead>
            <TableHead className="text-gray-300 font-semibold text-center">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        {/* ===== Body ===== */}
        <TableBody>
          {plans?.length ? (
            plans.map((plan) => (
              <TableRow
                key={plan.id}
                className="hover:bg-white/[0.05] transition-all duration-200 border-b border-white/[0.03]"
              >
                {/* Name */}
                <TableCell className="font-medium text-gray-100">
                  {plan.name}
                </TableCell>

                {/* Price */}
                <TableCell className="text-gray-300">
                  ₹{plan.price}/mo
                </TableCell>

                {/* Storage */}
                <TableCell className="text-gray-400">{plan.storage}GB</TableCell>

                {/* Features */}
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {plan.features?.map((feature: string) => (
                      <span
                        key={feature}
                        className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300 shadow-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </TableCell>

                {/* Active Switch */}
                <TableCell className="text-center">
                  <Switch
                    checked={plan.active}
                    className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-gray-600"
                  />
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-300 hover:text-indigo-400 hover:bg-white/[0.05] transition-all"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-300 hover:text-red-400 hover:bg-white/[0.05] transition-all"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-gray-500 italic"
              >
                No plans available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
