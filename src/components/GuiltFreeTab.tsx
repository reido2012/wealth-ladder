import React from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { currencyFormat, convertToUSD, uid, num } from '../lib/format'
import { NumberInput } from './NumberInput'
import { monthKey, nextMonthKey } from '../lib/math'
import type { Row, SavingsGoal, GuiltFreeData } from '../types'

const defaultLongTermGoals = [
  { id: uid(), name: 'Emergency Fund', amount: 0, type: 'long-term' as const },
  { id: uid(), name: 'LS100', amount: 0, type: 'long-term' as const },
  { id: uid(), name: 'LS60', amount: 0, type: 'long-term' as const },
]

const defaultShortTermGoals = [
  { id: uid(), name: 'Holiday', amount: 0, type: 'short-term' as const },
]

export function GuiltFreeTab({
  guiltFreeData,
  setGuiltFreeData,
  fixedCosts,
  gbpRate,
}: {
  guiltFreeData: GuiltFreeData[]
  setGuiltFreeData: (data: GuiltFreeData[]) => void
  fixedCosts: Row[]
  gbpRate: number
}) {
  const [currentMonth, setCurrentMonth] = React.useState(monthKey(new Date()))

  const currentData = guiltFreeData.find(d => d.month === currentMonth) || {
    month: currentMonth,
    takeHomePay: 0,
    savingsGoals: [...defaultLongTermGoals, ...defaultShortTermGoals]
  }

  const updateCurrentData = (updates: Partial<GuiltFreeData>) => {
    const updated = { ...currentData, ...updates }
    const newData = guiltFreeData.filter(d => d.month !== currentMonth)
    newData.push(updated)
    setGuiltFreeData(newData)
  }

  const fixedCostsUSD = fixedCosts.reduce((sum, r) => sum + convertToUSD(num(r.amount), r.currency, gbpRate), 0)
  
  const longTermGoals = currentData.savingsGoals.filter(g => g.type === 'long-term')
  const shortTermGoals = currentData.savingsGoals.filter(g => g.type === 'short-term')
  
  const totalLongTerm = longTermGoals.reduce((sum, g) => sum + g.amount, 0)
  const totalShortTerm = shortTermGoals.reduce((sum, g) => sum + g.amount, 0)
  
  // Progressive calculations
  const afterFixedCosts = currentData.takeHomePay - fixedCostsUSD
  const afterLongTermSavings = afterFixedCosts - totalLongTerm
  const guiltFreeNumber = afterLongTermSavings - totalShortTerm

  const addGoal = (type: 'long-term' | 'short-term') => {
    const newGoal: SavingsGoal = {
      id: uid(),
      name: type === 'long-term' ? 'New Investment' : 'New Goal',
      amount: 0,
      type
    }
    updateCurrentData({
      savingsGoals: [...currentData.savingsGoals, newGoal]
    })
  }

  const updateGoal = (goalId: string, updates: Partial<SavingsGoal>) => {
    const updatedGoals = currentData.savingsGoals.map(g => 
      g.id === goalId ? { ...g, ...updates } : g
    )
    updateCurrentData({ savingsGoals: updatedGoals })
  }

  const removeGoal = (goalId: string) => {
    const updatedGoals = currentData.savingsGoals.filter(g => g.id !== goalId)
    updateCurrentData({ savingsGoals: updatedGoals })
  }

  const goToPrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number)
    const prevDate = new Date(year, month - 2, 1) // month - 2 because Date month is 0-indexed
    setCurrentMonth(monthKey(prevDate))
  }

  const goToNextMonth = () => {
    setCurrentMonth(nextMonthKey(currentMonth))
  }

  // Scenario calculations
  const scenario1 = { ...currentData, takeHomePay: currentData.takeHomePay * 1.1 } // 10% raise
  const scenario2 = { 
    ...currentData, 
    savingsGoals: currentData.savingsGoals.map(g => 
      g.name === 'LS100' ? { ...g, amount: g.amount + 200 } : g
    )
  }

  const calculateGuiltFree = (data: GuiltFreeData) => {
    const longTerm = data.savingsGoals.filter(g => g.type === 'long-term').reduce((sum, g) => sum + g.amount, 0)
    const shortTerm = data.savingsGoals.filter(g => g.type === 'short-term').reduce((sum, g) => sum + g.amount, 0)
    return data.takeHomePay - fixedCostsUSD - longTerm - shortTerm
  }

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={goToPrevMonth} className="p-2 rounded-lg hover:bg-slate-100">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">{currentMonth}</h2>
          {currentMonth !== monthKey(new Date()) && (
            <button 
              onClick={() => setCurrentMonth(monthKey(new Date()))} 
              className="px-3 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
            >
              Current Month
            </button>
          )}
        </div>
        <button onClick={goToNextMonth} className="p-2 rounded-lg hover:bg-slate-100">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Guilt-Free Number Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow border border-purple-300/30">
        <div className="text-xs uppercase tracking-wide opacity-90">Guilt-free spending — {currentMonth}</div>
        <div className="text-4xl font-bold mt-1">{currencyFormat(Math.max(0, guiltFreeNumber))}</div>
        <div className="text-sm opacity-90 mt-1">
          {guiltFreeNumber < 0 ? 'Over budget - consider adjusting goals' : 'Available for guilt-free spending'}
        </div>
      </div>

      {/* Take-Home Pay */}
      <div className="rounded-2xl border bg-white/80 p-4">
        <h3 className="font-semibold mb-3">Monthly Take-Home Pay</h3>
        <NumberInput
          className="w-full rounded-xl border px-3 py-2"
          placeholder="Enter monthly take-home pay"
          value={currentData.takeHomePay}
          onChange={(val) => updateCurrentData({ takeHomePay: val })}
        />
      </div>

      {/* Fixed Costs Summary */}
      <div className="rounded-2xl border bg-slate-50 p-4">
        <h3 className="font-semibold mb-2">Fixed Costs (from Net Worth tab)</h3>
        <div className="text-2xl font-bold text-slate-700">{currencyFormat(fixedCostsUSD)}</div>
        <div className="text-sm text-slate-600 mt-1">{fixedCosts.length} items</div>
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="text-sm text-slate-600">Remaining after fixed costs:</div>
          <div className={`text-lg font-semibold ${afterFixedCosts >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {currencyFormat(afterFixedCosts)}
          </div>
        </div>
      </div>

      {/* Long-term Savings Goals */}
      <div className="rounded-2xl border bg-white/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Long-term Savings & Investments</h3>
          <button onClick={() => addGoal('long-term')} className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200">
            <Plus size={14} /> Add
          </button>
        </div>
        <div className="space-y-2">
          {longTermGoals.map(goal => (
            <div key={goal.id} className="grid grid-cols-12 gap-2 items-center">
              <input
                className="col-span-6 rounded-xl border px-3 py-2"
                value={goal.name}
                onChange={(e) => updateGoal(goal.id, { name: e.target.value })}
                placeholder="Goal name"
              />
              <NumberInput
                className="col-span-4 rounded-xl border px-3 py-2"
                value={goal.amount}
                onChange={(val) => updateGoal(goal.id, { amount: val })}
                placeholder="Amount"
              />
              <div className="col-span-1 text-right">
                <button onClick={() => removeGoal(goal.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-right font-semibold">
          Total: {currencyFormat(totalLongTerm)}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="text-sm text-slate-600">Remaining after long-term savings:</div>
          <div className={`text-lg font-semibold ${afterLongTermSavings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {currencyFormat(afterLongTermSavings)}
          </div>
        </div>
      </div>

      {/* Short-term Savings Goals */}
      <div className="rounded-2xl border bg-white/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Short-term Savings Goals</h3>
          <button onClick={() => addGoal('short-term')} className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
            <Plus size={14} /> Add
          </button>
        </div>
        <div className="space-y-2">
          {shortTermGoals.map(goal => (
            <div key={goal.id} className="grid grid-cols-12 gap-2 items-center">
              <input
                className="col-span-6 rounded-xl border px-3 py-2"
                value={goal.name}
                onChange={(e) => updateGoal(goal.id, { name: e.target.value })}
                placeholder="Goal name"
              />
              <NumberInput
                className="col-span-4 rounded-xl border px-3 py-2"
                value={goal.amount}
                onChange={(val) => updateGoal(goal.id, { amount: val })}
                placeholder="Amount"
              />
              <div className="col-span-1 text-right">
                <button onClick={() => removeGoal(goal.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-right font-semibold">
          Total: {currencyFormat(totalShortTerm)}
        </div>
        <div className="mt-3 pt-3 border-t border-emerald-200 bg-emerald-50 rounded-xl p-3">
          <div className="text-sm text-emerald-700 font-medium">🎉 Final Guilt-Free Amount:</div>
          <div className={`text-2xl font-bold ${guiltFreeNumber >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {currencyFormat(Math.max(0, guiltFreeNumber))}
          </div>
          {guiltFreeNumber < 0 && (
            <div className="text-sm text-red-600 mt-1">
              Over budget by {currencyFormat(Math.abs(guiltFreeNumber))}
            </div>
          )}
        </div>
      </div>

      {/* Scenarios */}
      <div className="rounded-2xl border bg-white/80 p-4">
        <h3 className="font-semibold mb-4">What-If Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current */}
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-sm font-medium text-slate-600">Current</div>
            <div className="text-xl font-bold mt-1">{currencyFormat(Math.max(0, guiltFreeNumber))}</div>
            <div className="text-xs text-slate-500 mt-1">Take-home: {currencyFormat(currentData.takeHomePay)}</div>
          </div>
          
          {/* Scenario 1: 10% Raise */}
          <div className="rounded-xl bg-emerald-50 p-3">
            <div className="text-sm font-medium text-emerald-600">10% Pay Raise</div>
            <div className="text-xl font-bold mt-1">{currencyFormat(Math.max(0, calculateGuiltFree(scenario1)))}</div>
            <div className="text-xs text-emerald-500 mt-1">Take-home: {currencyFormat(scenario1.takeHomePay)}</div>
          </div>

          {/* Scenario 2: Extra LS100 */}
          <div className="rounded-xl bg-blue-50 p-3">
            <div className="text-sm font-medium text-blue-600">+£200 LS100</div>
            <div className="text-xl font-bold mt-1">{currencyFormat(Math.max(0, calculateGuiltFree(scenario2)))}</div>
            <div className="text-xs text-blue-500 mt-1">More investing</div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="rounded-2xl border bg-white/80 p-4">
        <h3 className="font-semibold mb-3">Monthly Breakdown</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Take-home pay</span>
            <span className="font-medium">{currencyFormat(currentData.takeHomePay)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Fixed costs</span>
            <span>-{currencyFormat(fixedCostsUSD)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Long-term savings</span>
            <span>-{currencyFormat(totalLongTerm)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Short-term savings</span>
            <span>-{currencyFormat(totalShortTerm)}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-bold text-lg">
            <span>Guilt-free spending</span>
            <span className={guiltFreeNumber >= 0 ? 'text-green-600' : 'text-red-600'}>
              {currencyFormat(Math.max(0, guiltFreeNumber))}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
