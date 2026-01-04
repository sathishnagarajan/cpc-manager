"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const TEXT_SIZES = {
  small: "text-sm",
  normal: "text-base",
  large: "text-lg",
  xlarge: "text-xl",
}

export function TextSizeToggle() {
  const [textSize, setTextSize] = React.useState<keyof typeof TEXT_SIZES>("normal")

  React.useEffect(() => {
    const saved = localStorage.getItem("text-size") as keyof typeof TEXT_SIZES
    if (saved && TEXT_SIZES[saved]) {
      setTextSize(saved)
      document.documentElement.classList.remove(...Object.values(TEXT_SIZES))
      document.documentElement.classList.add(TEXT_SIZES[saved])
    }
  }, [])

  const changeTextSize = (size: keyof typeof TEXT_SIZES) => {
    setTextSize(size)
    localStorage.setItem("text-size", size)
    document.documentElement.classList.remove(...Object.values(TEXT_SIZES))
    document.documentElement.classList.add(TEXT_SIZES[size])
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <span className="font-bold">A</span>
          <span className="sr-only">Change text size</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeTextSize("small")}>
          <span className="text-sm">A-</span>
          <span className="ml-2">Small</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeTextSize("normal")}>
          <span className="text-base">A</span>
          <span className="ml-2">Normal</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeTextSize("large")}>
          <span className="text-lg">A+</span>
          <span className="ml-2">Large</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeTextSize("xlarge")}>
          <span className="text-xl">A++</span>
          <span className="ml-2">Extra Large</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
