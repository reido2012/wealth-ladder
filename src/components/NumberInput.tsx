import React from 'react'
import { formatNumberWithCommas, parseCommaNumber } from '../lib/format'

interface NumberInputProps {
  value: number | string
  onChange: (value: number) => void
  placeholder?: string
  className?: string
  step?: string
}

export function NumberInput({ value, onChange, placeholder, className, step }: NumberInputProps) {
  const [displayValue, setDisplayValue] = React.useState(() => 
    value !== null && value !== undefined && value !== '' ? formatNumberWithCommas(value) : ''
  )

  // Update display value when prop changes
  React.useEffect(() => {
    setDisplayValue(value !== null && value !== undefined && value !== '' ? formatNumberWithCommas(value) : '')
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Allow empty input
    if (inputValue === '') {
      setDisplayValue('')
      onChange(0)
      return
    }

    // Only allow numbers, commas, and decimal points
    const cleanInput = inputValue.replace(/[^0-9,.-]/g, '')
    
    // Don't format during typing - just store the clean input
    // This allows users to type decimals naturally (e.g., "100.53")
    setDisplayValue(cleanInput)
    
    // Parse and send the numeric value to parent
    const numericValue = parseCommaNumber(cleanInput)
    onChange(numericValue)
  }

  const handleBlur = () => {
    // Re-format on blur to ensure consistent formatting
    if (displayValue) {
      const numericValue = parseCommaNumber(displayValue)
      setDisplayValue(formatNumberWithCommas(numericValue))
    }
  }

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      step={step}
    />
  )
}


