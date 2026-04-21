import { useState, useRef, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, parse, isValid } from 'date-fns'
import { CalendarIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import 'react-day-picker/style.css'

interface DatePickerProps {
  value?: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  nullable?: boolean
}

export function DatePicker({ value, onChange, placeholder = 'Select date', disabled, id, nullable }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const parsed = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const validDate = parsed && isValid(parsed) ? parsed : undefined

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex h-9 w-full items-center rounded-md border border-input bg-background px-3 text-sm',
          'transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !validDate && 'text-muted-foreground'
        )}
      >
        <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0 text-indigo-500" />
        <span className="flex-1 text-left truncate">
          {validDate ? format(validDate, 'MMM d, yyyy') : placeholder}
        </span>
        {nullable && validDate && (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onChange(null) }}
            className="ml-1 rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 rounded-xl border bg-white shadow-xl">
          <DayPicker
            mode="single"
            selected={validDate}
            defaultMonth={validDate ?? new Date()}
            captionLayout="dropdown"
            startMonth={new Date()}
            endMonth={new Date(new Date().getFullYear() + 3, 11)}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, 'yyyy-MM-dd'))
                setOpen(false)
              }
            }}
            style={{
              '--rdp-accent-color': '#4f46e5',
              '--rdp-accent-background-color': '#e0e7ff',
            } as React.CSSProperties}
          />
        </div>
      )}
    </div>
  )
}
