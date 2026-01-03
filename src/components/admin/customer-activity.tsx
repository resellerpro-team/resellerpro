// import { createClient } from '@/lib/supabase/server'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// interface CustomerActivityProps {
//   id: string
// }

// export async function CustomerActivity({ id }: CustomerActivityProps) {
//   const supabase = await createClient()
  
//   const { data: activities } = await supabase
//     .from('activities')
//     .select('*')
//     .eq('user_id', id)
//     .order('created_at', { ascending: false })
//     .limit(10)

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Recent Activity</CardTitle>
//       </CardHeader>
//       <CardContent>
//         {activities?.length ? (
//           <ul className="space-y-4">
//             {activities.map((activity) => (
//               <li key={activity.id} className="flex items-center justify-between">
//                 <span>{activity.description}</span>
//                 <span className="text-sm text-muted-foreground">
//                   {new Date(activity.created_at).toLocaleDateString()}
//                 </span>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p className="text-sm text-muted-foreground">No recent activity</p>
//         )}
//       </CardContent>
//     </Card>
//   )
// }

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CustomerActivityProps {
  id: string
}

export async function CustomerActivity({ id }: CustomerActivityProps) {
  const supabase = await createClient()

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-md rounded-2xl transition-all hover:border-indigo-500/30">
      <CardHeader className="border-b border-white/[0.05] pb-4">
        <CardTitle className="text-lg font-semibold text-gray-100 tracking-wide">
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-5">
        {activities?.length ? (
          <ul className="space-y-4">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="flex items-center justify-between border-b border-white/[0.05] pb-3 last:border-0"
              >
                <span className="text-sm text-gray-300">
                  {activity.description}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(activity.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic text-center">
            No recent activity found
          </p>
        )}
      </CardContent>
    </Card>
  )
}

