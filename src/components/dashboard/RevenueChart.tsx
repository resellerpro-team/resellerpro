// "use client"

// import { TrendingUp } from "lucide-react"
// import { CartesianGrid, Area, AreaChart, XAxis, YAxis } from "recharts"

// import { CardFooter } from "@/components/ui/card"
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart"

// interface RevenueData {
//   day: string
//   revenue: number
// }

// const chartData: RevenueData[] = [
//   { day: "Sunday", revenue: 2286 },
//   { day: "Monday", revenue: 4405 },
//   { day: "Tuesday", revenue: 5037 },
//   { day: "Wednesday", revenue: 3037 },
//   { day: "Thursday", revenue: 2203 },
//   { day: "Friday", revenue: 6009 },
//   { day: "Saturday", revenue: 4200 },
// ]

// const chartConfig: ChartConfig = {
//   revenue: {
//     label: "Revenue",
//     color: "blue",
//   },
// }

// export function RevenueChart() {
//   // ✅ Auto Y-axis scale based on highest revenue
//   const maxRevenue = Math.max(...chartData.map((d) => d.revenue))
//   const roundedMax = Math.ceil(maxRevenue / 1000) * 1000 || 1000

//   return (
//     <div className="h-fit sm:h-full grid items-center">
//       <ChartContainer config={chartConfig}>
//         <AreaChart
//           accessibilityLayer
//           data={chartData}
//           margin={{ top: 12, left: -15, right: 0, bottom: 0 }}
//         >
//           <CartesianGrid vertical={false} />

//           {/* ✅ Dynamic Y Axis */}
//           <YAxis
//             domain={[0, roundedMax]}
//             ticks={Array.from({ length: roundedMax / 100 + 1 }, (_, i) => i * 100)}
//           />

//           <XAxis
//             dataKey="day"
//             tickLine={false}
//             axisLine={false}
//             tickMargin={8}
//             tickFormatter={(value: string) => value.slice(0, 3)}
//           />

//           <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />

//           <Area
//             dataKey="revenue"
//             type="natural"
//             stroke="blue"
//             strokeWidth={2}
//             fill="rgba(0, 0, 255, 0.25)"
//             dot={{ r: 2 }}
//             activeDot={{ r: 6 }}
//           />
//         </AreaChart>
//       </ChartContainer>

//       <CardFooter className="flex-col items-center gap-2 text-sm w-full mt-10 sm:mt-0">
//         <div className="flex gap-2 leading-none font-medium text-black flex-nowrap">
//           Trending up by <span className="text-green-600">5.2% </span> this week{" "}
//           <TrendingUp className="h-4 w-4 text-blue-700" />
//         </div>
//         <div className="text-muted-foreground leading-none text-black">
//           Showing daily total revenue
//         </div>
//       </CardFooter>
//     </div>
//   )
// }



"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Area, AreaChart, XAxis, YAxis } from "recharts"

import { CardFooter } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface RevenueData {
  day: string
  revenue: number
}

interface RevenueChartProps {
  data: RevenueData[]
}

const chartConfig: ChartConfig = {
  revenue: {
    label: "Revenue",
    color: "blue",
  },
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Fallback data if no data is provided
  const fallbackData: RevenueData[] = [
    { day: "Sunday", revenue: 0 },
    { day: "Monday", revenue: 0 },
    { day: "Tuesday", revenue: 0 },
    { day: "Wednesday", revenue: 0 },
    { day: "Thursday", revenue: 0 },
    { day: "Friday", revenue: 0 },
    { day: "Saturday", revenue: 0 },
  ]

  const chartData = data && data.length > 0 ? data : fallbackData

  // ✅ Auto Y-axis scale based on highest revenue
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue))
  const roundedMax = Math.ceil(maxRevenue / 1000) * 1000 || 1000

  // Calculate total revenue for the period
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)
  
  // Calculate week-over-week growth (comparing last 7 days with previous 7 days)
  // For now, we'll show a simple percentage based on average daily revenue
  const avgRevenue = totalRevenue / chartData.length
  const lastDayRevenue = chartData[chartData.length - 1]?.revenue || 0
  const weeklyGrowth = avgRevenue > 0 
    ? (((lastDayRevenue - avgRevenue) / avgRevenue) * 100).toFixed(1)
    : "0.0"

  return (
    <div className="h-fit sm:h-full grid items-center">
      <ChartContainer config={chartConfig}>
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 12, left: -15, right: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} />

          {/* ✅ Dynamic Y Axis */}
          <YAxis
            domain={[0, roundedMax]}
            ticks={Array.from({ length: Math.min(roundedMax / 1000, 10) + 1 }, (_, i) => i * 1000)}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />

          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value: string) => value.slice(0, 3)}
          />

          <ChartTooltip 
            cursor={false} 
            content={<ChartTooltipContent 
              hideLabel 
              formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
            />} 
          />

          <Area
            dataKey="revenue"
            type="natural"
            stroke="blue"
            strokeWidth={2}
            fill="rgba(0, 0, 255, 0.25)"
            dot={{ r: 2 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ChartContainer>

      <CardFooter className="flex-col items-center gap-2 text-sm w-full mt-10 sm:mt-0">
        <div className="flex gap-2 leading-none font-medium text-black flex-nowrap">
          {totalRevenue > 0 ? (
            <>
              Trending {Number(weeklyGrowth) >= 0 ? 'up' : 'down'} by{" "}
              <span className={Number(weeklyGrowth) >= 0 ? "text-green-600" : "text-red-600"}>
                {Math.abs(Number(weeklyGrowth))}%
              </span>{" "}
              this week{" "}
              <TrendingUp className={`h-4 w-4 ${Number(weeklyGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </>
          ) : (
            <>
              No revenue data yet{" "}
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none text-black">
          Showing daily total revenue for the last 7 days
        </div>
      </CardFooter>
    </div>
  )
}
