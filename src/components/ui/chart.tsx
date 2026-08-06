import * as React from "react"
import * as ChartPrimitive from "recharts"
import { cn } from "@/lib/utils"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: Record<string, any>
  }
>(({ className, children, config, ...props }, ref) => (
  <div ref={ref} className={cn("w-full", className)} {...props}>
    <ChartPrimitive.ResponsiveContainer width="100%" height="100%">
      {children}
    </ChartPrimitive.ResponsiveContainer>
  </div>
))
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = ChartPrimitive.Tooltip

const ChartLegend = ChartPrimitive.Legend

export { ChartContainer, ChartTooltip, ChartLegend }
