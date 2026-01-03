'use client'

import * as React from 'react'
import { CalendarIcon, X } from 'lucide-react'
import { addDays, format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { useRouter, useSearchParams } from 'next/navigation'

import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function DateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize date from URL params or undefined (all time)
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    
    if (from && to) {
      return {
        from: new Date(from),
        to: new Date(to),
      }
    }
    
    // Default: undefined (show all time)
    return undefined
  })

  const [isOpen, setIsOpen] = React.useState(false)

  // Update URL when date changes
  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate)
    
    if (newDate?.from && newDate?.to) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('from', format(newDate.from, 'yyyy-MM-dd'))
      params.set('to', format(newDate.to, 'yyyy-MM-dd'))
      router.push(`?${params.toString()}`)
      setIsOpen(false)
    }
  }

  // Quick date range presets
  const handlePresetRange = (days: number) => {
    const newDate = {
      from: addDays(new Date(), -days + 1),
      to: new Date(),
    }
    handleDateChange(newDate)
  }

  // Reset to all time
  const handleReset = () => {
    setDate(undefined)
    router.push(window.location.pathname) // Clear all params
    setIsOpen(false)
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>All Time</span>
            )}
            {date && (
              <X 
                className="ml-auto h-4 w-4 hover:text-destructive" 
                onClick={(e) => {
                  e.stopPropagation()
                  handleReset()
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b space-y-2">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetRange(7)}
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetRange(30)}
              >
                Last 30 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetRange(90)}
              >
                Last 90 days
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={handleReset}
            >
              All Time
            </Button>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
            disabled={(date) => date > new Date()} // Disable future dates
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}