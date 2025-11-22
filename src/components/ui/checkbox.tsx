import React from 'react'
import { Check } from 'lucide-react'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  id?: string
  disabled?: boolean
}

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  id,
  disabled = false,
}: CheckboxProps) {
  const handleChange = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={handleChange}
        disabled={disabled}
        className={`
          relative flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200
          ${checked
            ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-500 scale-100'
            : 'bg-white border-gray-300 hover:border-purple-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
          hover:scale-110 active:scale-95
        `}
      >
        {/* Checkmark with animation */}
        <Check
          className={`
            absolute inset-0 w-full h-full p-0.5 text-white transition-all duration-200
            ${checked
              ? 'opacity-100 scale-100 rotate-0'
              : 'opacity-0 scale-50 -rotate-90'
            }
          `}
        />

        {/* Ripple effect on check */}
        {checked && (
          <span className="absolute inset-0 rounded animate-ping opacity-75 bg-purple-400" style={{ animationDuration: '0.6s', animationIterationCount: '1' }} />
        )}
      </button>

      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label
              htmlFor={id}
              className="font-semibold text-gray-900 cursor-pointer select-none"
              onClick={handleChange}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-600 mt-0.5">{description}</p>
          )}
        </div>
      )}
    </div>
  )
}
