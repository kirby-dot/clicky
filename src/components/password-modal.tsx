'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, AlertCircle } from 'lucide-react'
import { GlassButton } from '@/components/ui/glass'

interface PasswordModalProps {
  isOpen: boolean
  onCorrectPassword: () => void
  onCheckPassword: (password: string) => boolean
}

export function PasswordModal({ isOpen, onCorrectPassword, onCheckPassword }: PasswordModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChecking(true)
    setError(false)

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300))

    const isCorrect = onCheckPassword(password)

    if (isCorrect) {
      onCorrectPassword()
    } else {
      setError(true)
      setPassword('')
    }

    setIsChecking(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl z-[9998]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-accent-400 to-purple-500 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Lock className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Protected Profile</h2>
                <p className="text-white/90 text-sm">Enter password to view this content</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8">
                <div className="space-y-4">
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setError(false)
                      }}
                      placeholder="Enter password"
                      className={`w-full bg-white/50 backdrop-blur-xl border-2 ${
                        error ? 'border-red-400' : 'border-white/20'
                      } rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-400/50 transition-all`}
                      autoFocus
                      disabled={isChecking}
                    />

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2 mt-2 text-red-600 text-sm"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>Incorrect password. Please try again.</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <GlassButton
                    type="submit"
                    disabled={!password || isChecking}
                    className="w-full bg-gradient-to-r from-accent-400 to-purple-500 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChecking ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Checking...</span>
                      </div>
                    ) : (
                      'Unlock Profile'
                    )}
                  </GlassButton>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
