import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { monthKey, nextMonthKey } from '../lib/math'
import { NetWorthBanner } from './NetWorthBanner'
import { WealthLevelCard } from './WealthLevelCard'
import { InstructionsCard } from './InstructionsCard'
import type { MonthlyNetWorthData } from '../types'

export function NetWorthTab({ 
  children, 
  folderHandle, 
  folderPath, 
  saveStatus,
  getCurrentMonthData,
  updateMonthlyData,
  gbpRate: globalGbpRate
}: { 
  children: (data: MonthlyNetWorthData, updateData: (updates: Partial<MonthlyNetWorthData>) => void) => React.ReactNode
  folderHandle: any
  folderPath: string
  saveStatus: string
  getCurrentMonthData: (month: string) => MonthlyNetWorthData
  updateMonthlyData: (month: string, updates: Partial<MonthlyNetWorthData>) => void
  gbpRate: number
}) {
  const [currentMonth, setCurrentMonth] = React.useState(monthKey(new Date()))
  
  const monthData = getCurrentMonthData(currentMonth)
  const updateData = (updates: Partial<MonthlyNetWorthData>) => {
    updateMonthlyData(currentMonth, updates)
  }

  // Calculate totals for current month
  const totals = React.useMemo(() => {
    const gbpRate = monthData.settings.gbpRate
    const assetUSD = monthData.assets.reduce((sum, r) => sum + (r.currency === 'USD' ? r.amount : r.amount * gbpRate), 0)
    const liabUSD = monthData.liabilities.reduce((sum, r) => sum + (r.currency === 'USD' ? r.amount : r.amount * gbpRate), 0)
    const fixedUSD = monthData.fixedCosts.reduce((sum, r) => sum + (r.currency === 'USD' ? r.amount : r.amount * gbpRate), 0)
    return { assetUSD, liabUSD, fixedUSD, netWorth: assetUSD - liabUSD }
  }, [monthData])

  const goToPrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number)
    const prevDate = new Date(year, month - 2, 1) // month - 2 because Date month is 0-indexed
    setCurrentMonth(monthKey(prevDate))
  }

  const goToNextMonth = () => {
    setCurrentMonth(nextMonthKey(currentMonth))
  }

  return (
    <>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={goToPrevMonth} className="p-2 rounded-lg hover:bg-slate-100">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">{currentMonth}</h2>
          {currentMonth !== monthKey(new Date()) && (
            <button 
              onClick={() => setCurrentMonth(monthKey(new Date()))} 
              className="px-3 py-1 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors"
            >
              Current Month
            </button>
          )}
        </div>
        <button onClick={goToNextMonth} className="p-2 rounded-lg hover:bg-slate-100">
          <ChevronRight size={20} />
        </button>
      </div>

      <NetWorthBanner totals={totals} folderHandle={folderHandle} folderPath={folderPath} saveStatus={saveStatus} />
      <WealthLevelCard netWorth={totals.netWorth} />
      <InstructionsCard />
      
      {children(monthData, updateData)}
    </>
  )
}
