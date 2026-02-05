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
import { formatAbbr } from "@/lib/utils/number-format"

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

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue))

  const getNiceInterval = (maxValue: number): number => {
    if (maxValue === 0) return 200
    const roughInterval = maxValue / 5
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughInterval)))
    const fraction = roughInterval / magnitude
    let niceFraction
    if (fraction <= 1) niceFraction = 1
    else if (fraction <= 2) niceFraction = 2
    else if (fraction <= 2.5) niceFraction = 2.5
    else if (fraction <= 5) niceFraction = 5
    else niceFraction = 10
    return niceFraction * magnitude
  }

  const interval = getNiceInterval(maxRevenue)
  const yAxisMax = interval * 5
  const yAxisTicks = [interval, interval * 2, interval * 3, interval * 4, interval * 5]

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)
  const avgRevenue = totalRevenue / chartData.length
  const lastDayRevenue = chartData[chartData.length - 1]?.revenue || 0
  const weeklyGrowth =
    avgRevenue > 0 ? (((lastDayRevenue - avgRevenue) / avgRevenue) * 100).toFixed(1) : "0.0"

  return (
    <div className="h-fit grid items-center">
      <ChartContainer config={chartConfig}>
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 12, left: -12, right: 5, bottom: 0 }}
        >
          <CartesianGrid vertical={false} />

          {/* ✅ Y-axis with abbreviated values */}
          <YAxis
            domain={[0, yAxisMax]}
            ticks={yAxisTicks}
            tickFormatter={(value) => formatAbbr(Number(value))}
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
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
              />
            }
          />

          <Area
            dataKey="revenue"
            type="natural"
            stroke="#3A72EC"
            strokeWidth={2}
            fill="hsl(221.2deg 100% 77.78%)"
            dot={{ r: 2 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ChartContainer>

      <CardFooter className="flex-col items-center gap-2 text-sm w-full">
        <div className="flex gap-2 leading-none font-bold text-muted-foreground mt-10">
          {totalRevenue > 0 ? (
            <div className="flex flex-nowrap">
              Trending {Number(weeklyGrowth) >= 0 ? "up" : "down"} by{" "}
              <span
                className={
                  Number(weeklyGrowth) >= 0 ? "text-green-600 px-1" : "text-red-600 px-1"
                }
              >
                {Math.abs(Number(weeklyGrowth))}%
              </span>{" "}
              this week{" "}
              <TrendingUp
                className={`h-4 w-4 ${
                  Number(weeklyGrowth) >= 0 ? "text-green-600" : "text-red-600"
                }`}
              />
            </div>
          ) : (
            <>
              No revenue data yet{" "}
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none text-black text-center">
          Showing daily total revenue for the last 7 days
        </div>
      </CardFooter>
    </div>
  )
}
