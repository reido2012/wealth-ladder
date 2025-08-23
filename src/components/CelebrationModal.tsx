import React from 'react'
import Confetti from 'react-confetti'

export function CelebrationModal({ open, onClose, month, netChangeUSD, antiSavedUSD, antiCount }: {
  open: boolean
  onClose: () => void
  month: string
  netChangeUSD: number
  antiSavedUSD: number
  antiCount: number
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <Confetti numberOfPieces={300} recycle={false} />
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6 relative">
          <button className="absolute top-3 right-3 text-slate-500 hover:text-slate-700" onClick={onClose} aria-label="Close">✕</button>
          <div className="text-2xl font-bold text-center">🎉 {month} Complete!</div>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-emerald-50 p-3">
              <div className="text-sm text-emerald-700">Net Worth Growth</div>
              <div className="text-xl font-semibold text-emerald-900">${Math.round(netChangeUSD).toLocaleString()}</div>
            </div>
            <div className="rounded-xl bg-blue-50 p-3">
              <div className="text-sm text-blue-700">Smart Choice Wins</div>
              <div className="text-xl font-semibold text-blue-900">${Math.round(antiSavedUSD).toLocaleString()} • {antiCount} wins</div>
            </div>
            <div className="text-center text-slate-700 text-sm">Building wealth AND avoiding waste. Keep the streak going! 💪</div>
          </div>
          <div className="mt-5 flex items-center justify-center gap-2">
            <button className="rounded-xl bg-black text-white px-4 py-2 hover:opacity-90" onClick={onClose}>🎊 Amazing Month!</button>
          </div>
        </div>
      </div>
    </div>
  )
}


