import * as React from "react"

import { cn } from "@/lib/utils"

type SeparatorProps = React.HTMLAttributes<HTMLHRElement> & {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
}

const Separator = React.forwardRef<HTMLHRElement, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
    <hr
      ref={ref}
      aria-hidden={decorative}
      className={cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className)}
      {...props}
    />
  )
)
Separator.displayName = "Separator"

export { Separator }