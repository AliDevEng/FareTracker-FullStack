import { cn } from '@/lib/utils'

const CURRENCIES = [
  { value: 'SEK', label: 'SEK – Swedish Krona' },
  { value: 'EUR', label: 'EUR – Euro' },
  { value: 'GBP', label: 'GBP – British Pound' },
  { value: 'USD', label: 'USD – US Dollar' },
]

interface CurrencySelectProps {
  value: string
  onChange: (value: string) => void
  id?: string
  disabled?: boolean
}

export function CurrencySelect({ value, onChange, id, disabled }: CurrencySelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        'flex h-9 w-full cursor-pointer rounded-md border border-input bg-background px-3 text-sm',
        'transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50'
      )}
    >
      {CURRENCIES.map(c => (
        <option key={c.value} value={c.value}>{c.label}</option>
      ))}
    </select>
  )
}
