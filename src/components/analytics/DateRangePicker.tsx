'use client'

import * as React from 'react'
import { CalendarIcon, X, Filter, ArrowRight, Check } from 'lucide-react'
import { addDays, format, isSameDay } from 'date-fns'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useMediaQuery } from '@/hooks/use-media-query'

export function DateRangePicker({
  className,
  disabled = false,
}: React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Initialize from URL
  const initialDate = React.useMemo(() => {
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    if (from && to) return { from: new Date(from), to: new Date(to) }
    return undefined
  }, [searchParams])

  // Internal state for selection before applying
  const [date, setDate] = React.useState<DateRange | undefined>(initialDate)
  const [isOpen, setIsOpen] = React.useState(false)

  // Reset internal state when opening
  React.useEffect(() => {
    if (isOpen) {
      setDate(initialDate)
    }
  }, [isOpen, initialDate])

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate)
  }

  const applyDateRange = () => {
    if (date?.from && date?.to) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('from', format(date.from, 'yyyy-MM-dd'))
      params.set('to', format(date.to, 'yyyy-MM-dd'))
      router.push(`?${params.toString()}`)
      setIsOpen(false)
    }
  }

  const handlePresetRange = (days: number) => {
    const newDate = {
      from: addDays(new Date(), -days + 1),
      to: new Date(),
    }
    setDate(newDate)

    // Auto-apply for presets if desired, or let user click apply. 
    // Let's auto-apply for smoothness on presets
    const params = new URLSearchParams(searchParams.toString())
    params.set('from', format(newDate.from, 'yyyy-MM-dd'))
    params.set('to', format(newDate.to, 'yyyy-MM-dd'))
    router.push(`?${params.toString()}`)
    setIsOpen(false)
  }

  const handleReset = () => {
    setDate(undefined)
    router.push(window.location.pathname)
    setIsOpen(false)
  }

  // --- Render Components ---

  const triggerContent = (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      className={cn(
        'justify-start font-medium',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      <span className="truncate">
        Select Date
      </span>
      {(initialDate?.from || initialDate?.to) && !disabled && (
        <div className="ml-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      )}
    </Button>
  )

  const SelectionStatus = () => (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className={cn("p-3 rounded-xl border transition-all", date?.from ? "bg-primary/5 border-primary/20" : "bg-slate-50 border-slate-100")}>
        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Start Date</p>
        <p className={cn("text-sm font-semibold", date?.from ? "text-primary" : "text-slate-400 italic")}>
          {date?.from ? format(date.from, 'MMM dd, yyyy') : "Select..."}
        </p>
      </div>
      <div className={cn("p-3 rounded-xl border transition-all", date?.to ? "bg-primary/5 border-primary/20" : "bg-slate-50 border-slate-100")}>
        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">End Date</p>
        <p className={cn("text-sm font-semibold", date?.to ? "text-primary" : "text-slate-400 italic")}>
          {date?.to ? format(date.to, 'MMM dd, yyyy') : "Select..."}
        </p>
      </div>
    </div>
  )

  const pickerContent = (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Sidebar Presets */}
      <div className="p-4 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/50 w-full lg:w-48 flex flex-col gap-2 shrink-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Quick Picks</p>
        {[
          { label: 'Last 7 Days', days: 7 },
          { label: 'Last 30 Days', days: 30 },
          { label: 'Last 90 Days', days: 90 }
        ].map((preset) => (
          <Button
            key={preset.days}
            variant="ghost"
            size="sm"
            onClick={() => handlePresetRange(preset.days)}
            className="justify-start font-medium text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg h-9"
          >
            {preset.label}
          </Button>
        ))}
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="justify-start font-medium text-slate-400 hover:text-destructive hover:bg-destructive/5 rounded-lg h-9 mt-2"
        >
          Reset Filter
        </Button>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col p-4 w-full">
        <SelectionStatus />

        <div className="flex-1 flex justify-center bg-white rounded-xl border border-slate-100 p-2 shadow-sm mb-4">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={isMobile ? 1 : 2}
            disabled={(date) => date > new Date()}
            className="rounded-md"
          />
        </div>

        <Button
          onClick={applyDateRange}
          disabled={!date?.from || !date?.to}
          className="w-full h-11 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
        >
          <Check className="w-4 h-4 mr-2" />
          Apply Date Range
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Dialog open={isOpen && !disabled} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {triggerContent}
        </DialogTrigger>
        <DialogContent className="p-0 sm:max-w-[600px] w-full max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="p-4 bg-slate-50/80 border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                  <Filter className="w-4 h-4 text-slate-500" />
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900">Filter by Date</DialogTitle>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {pickerContent}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Popover open={isOpen && !disabled} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {triggerContent}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-2xl overflow-hidden bg-white" align="end">
        {pickerContent}
      </PopoverContent>
    </Popover>
  )
}
