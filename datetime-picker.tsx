"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock } from 'lucide-react'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export default function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
  className
}: DateTimePickerProps) {
  const [date, setDate] = useState<Date | undefined>(value)
  const [time, setTime] = useState(() => {
    if (value) {
      const hours24 = value.getHours()
      const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24
      const period = hours24 >= 12 ? 'PM' : 'AM'
      return {
        hours: hours12.toString().padStart(2, '0'),
        minutes: value.getMinutes().toString().padStart(2, '0'),
        period
      }
    }
    return {
      hours: '12',
      minutes: '00',
      period: 'AM'
    }
  })
  const [open, setOpen] = useState(false)

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDateTime = new Date(selectedDate)
      newDateTime.setHours(parseInt(time.hours), parseInt(time.minutes))
      setDate(newDateTime)
      onChange?.(newDateTime)
    } else {
      setDate(undefined)
      onChange?.(undefined)
    }
  }

  const handleTimeChange = (field: 'hours' | 'minutes' | 'period', value: string) => {
    const newTime = { ...time, [field]: value }
    setTime(newTime)
    
    if (date) {
      const newDateTime = new Date(date)
      let hours24 = parseInt(newTime.hours)
      
      // Convert 12-hour to 24-hour format
      if (newTime.period === 'AM') {
        hours24 = hours24 === 12 ? 0 : hours24
      } else {
        hours24 = hours24 === 12 ? 12 : hours24 + 12
      }
      
      newDateTime.setHours(hours24, parseInt(newTime.minutes))
      setDate(newDateTime)
      onChange?.(newDateTime)
    }
  }

  const formatDateTime = (date: Date) => {
    return format(date, "PPP 'at' p")
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? formatDateTime(date) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
            />
          </div>
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Time</Label>
            </div>
            <div className="flex items-center gap-2">
              <div className="grid gap-1">
                <Label htmlFor="hours" className="text-xs text-muted-foreground">
                  Hours
                </Label>
                <Input
                  id="hours"
                  type="number"
                  min="1"
                  max="12"
                  value={time.hours}
                  onChange={(e) => {
                    const value = Math.max(1, Math.min(12, parseInt(e.target.value) || 1))
                    handleTimeChange('hours', value.toString().padStart(2, '0'))
                  }}
                  className="w-16 text-center"
                />
              </div>
              <div className="text-xl font-bold text-muted-foreground">:</div>
              <div className="grid gap-1">
                <Label htmlFor="minutes" className="text-xs text-muted-foreground">
                  Minutes
                </Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={time.minutes}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                    handleTimeChange('minutes', value.toString().padStart(2, '0'))
                  }}
                  className="w-16 text-center"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="period" className="text-xs text-muted-foreground">
                  Period
                </Label>
                <div className="flex">
                  <Button
                    type="button"
                    variant={time.period === 'AM' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeChange('period', 'AM')}
                    className="rounded-r-none px-3"
                  >
                    AM
                  </Button>
                  <Button
                    type="button"
                    variant={time.period === 'PM' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeChange('period', 'PM')}
                    className="rounded-l-none px-3"
                  >
                    PM
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date()
                  const hours24 = now.getHours()
                  const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24
                  const period = hours24 >= 12 ? 'PM' : 'AM'
                  const newTime = {
                    hours: hours12.toString().padStart(2, '0'),
                    minutes: now.getMinutes().toString().padStart(2, '0'),
                    period
                  }
                  setTime(newTime)
                  if (date) {
                    const newDateTime = new Date(date)
                    newDateTime.setHours(now.getHours(), now.getMinutes())
                    setDate(newDateTime)
                    onChange?.(newDateTime)
                  }
                }}
              >
                Now
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDate(undefined)
                  setTime({ hours: '12', minutes: '00', period: 'AM' })
                  onChange?.(undefined)
                }}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => setOpen(false)}
                className="ml-auto"
              >
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
