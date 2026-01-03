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
// import { EyeIcon, CheckIcon, XIcon } from "lucide-react"

// export async function TicketsTable() {
//   const supabase = await createClient()

//   const { data: tickets } = await supabase
//     .from('support_tickets')
//     .select('*')
//     .order('created_at', { ascending: false })

//   return (
//     <div className="rounded-md border">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Ticket ID</TableHead>
//             <TableHead>Business</TableHead>
//             <TableHead>Message</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead>Created</TableHead>
//             <TableHead className="w-[150px]">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {tickets?.map((ticket) => (
//             <TableRow key={ticket.id}>
//               <TableCell>{ticket.id}</TableCell>
//               <TableCell>{ticket.business_name}</TableCell>
//               <TableCell>{ticket.message}</TableCell>
//               <TableCell>
//                 <span
//                   className={`inline-flex px-2 py-1 rounded-full text-xs ${
//                     ticket.status === 'open'
//                       ? 'bg-red-100 text-red-700'
//                       : 'bg-green-100 text-green-700'
//                   }`}
//                 >
//                   {ticket.status}
//                 </span>
//               </TableCell>
//               <TableCell>
//                 {new Date(ticket.created_at).toLocaleDateString()}
//               </TableCell>
//               <TableCell>
//                 <div className="flex space-x-2">
//                   <Button variant="ghost" size="icon">
//                     <EyeIcon className="h-4 w-4" />
//                   </Button>
//                   <Button variant="ghost" size="icon">
//                     <CheckIcon className="h-4 w-4" />
//                   </Button>
//                   <Button variant="ghost" size="icon">
//                     <XIcon className="h-4 w-4" />
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
import { EyeIcon, CheckIcon, XIcon } from 'lucide-react'

export async function TicketsTable() {
  const supabase = await createClient()

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-lg transition-all hover:border-indigo-500/30">
      <Table>
        {/* ===== Header ===== */}
        <TableHeader className="bg-white/[0.05] border-b border-white/[0.05]">
          <TableRow>
            <TableHead className="text-gray-300 font-semibold tracking-wide">
              Ticket ID
            </TableHead>
            <TableHead className="text-gray-300 font-semibold tracking-wide">
              Business
            </TableHead>
            <TableHead className="text-gray-300 font-semibold tracking-wide">
              Message
            </TableHead>
            <TableHead className="text-gray-300 font-semibold tracking-wide">
              Status
            </TableHead>
            <TableHead className="text-gray-300 font-semibold tracking-wide">
              Created
            </TableHead>
            <TableHead className="text-gray-300 font-semibold text-center">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        {/* ===== Body ===== */}
        <TableBody>
          {tickets?.length ? (
            tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="hover:bg-white/[0.05] transition-all duration-200 border-b border-white/[0.03]"
              >
                <TableCell className="font-medium text-gray-100">
                  {ticket.id}
                </TableCell>
                <TableCell className="text-gray-300">
                  {ticket.business_name || '—'}
                </TableCell>
                <TableCell className="text-gray-400 truncate max-w-xs">
                  {ticket.message || '—'}
                </TableCell>

                {/* Status Badge */}
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      ticket.status === 'open'
                        ? 'bg-red-500/10 text-red-400 border border-red-400/30'
                        : 'bg-green-500/10 text-green-400 border border-green-400/30'
                    }`}
                  >
                    {ticket.status}
                  </span>
                </TableCell>

                {/* Created Date */}
                <TableCell className="text-gray-500">
                  {new Date(ticket.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-300 hover:text-indigo-400 hover:bg-white/[0.05] transition-all"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-300 hover:text-green-400 hover:bg-white/[0.05] transition-all"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-300 hover:text-red-400 hover:bg-white/[0.05] transition-all"
                    >
                      <XIcon className="h-4 w-4" />
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
                No support tickets found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
