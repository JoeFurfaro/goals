import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        className="peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none checked:bg-primary checked:border-primary cursor-pointer"
        ref={ref}
        {...props}
      />
      <Check className="pointer-events-none absolute h-4 w-4 text-primary-foreground opacity-0 peer-checked:opacity-100" />
    </div>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
