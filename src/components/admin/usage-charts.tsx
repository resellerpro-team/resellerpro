// "use client"

// import { useEffect, useState } from "react"
// import { createClient } from "@/lib/supabase/client"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// interface ChartData {
//   date: string
//   db_size: number
//   storage: number
//   api_calls: number
// }

// export function UsageCharts() {
//   const [chartData, setChartData] = useState<ChartData[]>([]) // Explicitly define the type

//   useEffect(() => {
//     async function fetchData() {
//       const supabase = createClient()
//       const { data } = await supabase
//         .from("usage_metrics")
//         .select("date, db_size, storage, api_calls")
//         .order("date", { ascending: true })

//       if (data) {
//         setChartData(data as ChartData[]) // Type assertion to match the state type
//       }
//     }

//     fetchData()
//   }, [])

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Usage Trends</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="h-80">
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart data={chartData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="date" />
//               <YAxis />
//               <Tooltip />
//               <Line type="monotone" dataKey="db_size" stroke="#8884d8" name="DB Size (MB)" />
//               <Line type="monotone" dataKey="storage" stroke="#82ca9d" name="Storage (GB)" />
//               <Line type="monotone" dataKey="api_calls" stroke="#ffc658" name="API Calls" />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }


"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface ChartData {
  date: string
  db_size: number
  storage: number
  api_calls: number
}

export function UsageCharts() {
  const [chartData, setChartData] = useState<ChartData[]>([])

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data } = await supabase
        .from("usage_metrics")
        .select("date, db_size, storage, api_calls")
        .order("date", { ascending: true })

      if (data) {
        setChartData(data as ChartData[])
      }
    }

    fetchData()
  }, [])

  return (
    <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-lg rounded-2xl transition-all hover:border-indigo-500/30">
      <CardHeader className="border-b border-white/[0.05] pb-4">
        <CardTitle className="text-lg font-semibold text-gray-100 tracking-wide">
          Usage Trends
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              {/* Grid */}
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />

              {/* Axes */}
              <XAxis
                dataKey="date"
                stroke="#888"
                tick={{ fill: "#aaa", fontSize: 12 }}
                tickLine={{ stroke: "#555" }}
              />
              <YAxis
                stroke="#888"
                tick={{ fill: "#aaa", fontSize: 12 }}
                tickLine={{ stroke: "#555" }}
              />

              {/* Tooltip */}
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(17, 25, 40, 0.85)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "13px",
                  backdropFilter: "blur(8px)",
                }}
                labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
              />

              {/* Lines */}
              <Line
                type="monotone"
                dataKey="db_size"
                stroke="#6366f1"
                strokeWidth={2.5}
                name="DB Size (MB)"
                dot={{ r: 3, stroke: "#6366f1", strokeWidth: 1.5, fill: "#0f172a" }}
                activeDot={{ r: 5, fill: "#6366f1" }}
              />
              <Line
                type="monotone"
                dataKey="storage"
                stroke="#22c55e"
                strokeWidth={2.5}
                name="Storage (GB)"
                dot={{ r: 3, stroke: "#22c55e", strokeWidth: 1.5, fill: "#0f172a" }}
                activeDot={{ r: 5, fill: "#22c55e" }}
              />
              <Line
                type="monotone"
                dataKey="api_calls"
                stroke="#facc15"
                strokeWidth={2.5}
                name="API Calls"
                dot={{ r: 3, stroke: "#facc15", strokeWidth: 1.5, fill: "#0f172a" }}
                activeDot={{ r: 5, fill: "#facc15" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
