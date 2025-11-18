'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeCanvas } from 'qrcode.react'
import { GlassButton, GlassPanel } from '@/components/ui/glass'
import { X, Download, QrCode } from 'lucide-react'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  url: string
  profileName: string
}

export function QRCodeModal({ isOpen, onClose, url, profileName }: QRCodeModalProps) {
  const qrRef = useRef<HTMLDivElement>(null)

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `${profileName}-qr-code.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[9998]"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 w-full max-w-md pointer-events-auto overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ rotate: -180, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="p-3 bg-accent-100/50 rounded-xl"
                    >
                      <QrCode className="w-6 h-6 text-accent-600" />
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">QR Code</h2>
                      <p className="text-sm text-slate-600">Share your profile</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="p-2 hover:bg-white/50 rounded-lg"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </motion.button>
                </div>

                <div className="flex flex-col items-center gap-6">
                  {/* QR Code */}
                  <motion.div
                    ref={qrRef}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 bg-white rounded-2xl shadow-lg"
                  >
                    <QRCodeCanvas
                      value={url}
                      size={256}
                      level="H"
                      includeMargin={true}
                    />
                  </motion.div>

                  {/* URL */}
                  <div className="w-full">
                    <p className="text-xs font-semibold text-slate-600 mb-2 text-center">Profile URL</p>
                    <div className="bg-white/50 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2.5 text-center">
                      <p className="text-sm font-mono text-slate-800 break-all">{url}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 w-full">
                    <GlassButton
                      variant="secondary"
                      className="flex-1"
                      onClick={onClose}
                    >
                      Close
                    </GlassButton>
                    <GlassButton
                      className="flex-1"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </GlassButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
