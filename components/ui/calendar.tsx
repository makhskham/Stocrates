"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "relative flex items-center justify-center mb-4 w-full",
        caption_label: "mx-auto text-base font-semibold text-gray-800 dark:text-gray-200",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-1 h-8 w-8 bg-transparent p-0 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-1 h-8 w-8 bg-transparent p-0 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "grid grid-cols-7 w-full text-center",
        weekday: "text-indigo-600 dark:text-indigo-400 font-semibold text-sm flex items-center justify-center w-9",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        ),
        range_end: "day-range-end",
        selected: "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white focus:bg-indigo-600 focus:text-white font-semibold",
        today: "bg-indigo-600 text-white font-bold hover:bg-indigo-700",
        outside: "day-outside text-gray-400 dark:text-gray-600 opacity-50",
        disabled: "text-gray-300 dark:text-gray-700 opacity-50 cursor-not-allowed",
        range_middle: "aria-selected:bg-indigo-100 aria-selected:text-indigo-900",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
