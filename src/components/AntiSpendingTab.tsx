import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { currencyFormat, uid } from '../lib/format'
import { NumberInput } from './NumberInput'
import { monthKey, nextMonthKey } from '../lib/math'
import type { AntiSpendEntry } from '../types'

const defaultCategories = ['Food','Coffee','Transport','Shopping','Entertainment','Subscriptions','Impulse Buys','Takeout', 'Haircuts']

export function AntiSpendingTab({
  entries,
  setEntries,
}: {
  entries: AntiSpendEntry[]
  setEntries: (rows: AntiSpendEntry[]) => void
}) {
  const [currentMonth, setCurrentMonth] = React.useState(monthKey(new Date()))
  const [category, setCategory] = React.useState('Food')
  const [insteadOf, setInsteadOf] = React.useState('')
  const [iDid, setIDid] = React.useState('')
  const [amount, setAmount] = React.useState<number | ''>('')

  const categories = Array.from(new Set([...
    defaultCategories,
    ...entries.map(e=>e.category)
  ])).sort()

  const monthEntries = entries.filter(e=>e.month===currentMonth)
  const total = monthEntries.reduce((s,e)=>s+e.amount_saved,0)

  const goToPrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number)
    const prevDate = new Date(year, month - 2, 1) // month - 2 because Date month is 0-indexed
    setCurrentMonth(monthKey(prevDate))
  }

  const goToNextMonth = () => {
    setCurrentMonth(nextMonthKey(currentMonth))
  }

  function addEntry() {
    if (!amount || !category || (!insteadOf && !iDid)) return
    const row: AntiSpendEntry = {
      id: uid(),
      month: currentMonth,
      timestamp: new Date().toISOString(),
      instead_of: insteadOf,
      i_did: iDid,
      category,
      amount_saved: Number(amount)
    }
    setEntries([...entries, row])
    setInsteadOf(''); setIDid(''); setAmount('')
  }

  function remove(id: string) {
    setEntries(entries.filter(e=>e.id!==id))
  }

  return (
    <div className="space-y-4">
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
              className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
            >
              Current Month
            </button>
          )}
        </div>
        <button onClick={goToNextMonth} className="p-2 rounded-lg hover:bg-slate-100">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="rounded-3xl p-6 bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow border border-blue-300/30">
        <div className="text-xs uppercase tracking-wide opacity-90">Anti-spending wins — {currentMonth}</div>
        <div className="text-4xl font-bold mt-1">{currencyFormat(total)}</div>
        <div className="text-sm opacity-90 mt-1">{monthEntries.length} smart {monthEntries.length===1?'choice':'choices'}</div>
      </div>

      <div className="rounded-2xl border bg-white/80 p-4">
        <div className="grid md:grid-cols-5 gap-2">
          <input className="rounded-xl border px-3 py-2 md:col-span-2" placeholder="Instead of… (Uber Eats)" value={insteadOf} onChange={e=>setInsteadOf(e.target.value)} />
          <input className="rounded-xl border px-3 py-2 md:col-span-2" placeholder="I did… (cooked at home)" value={iDid} onChange={e=>setIDid(e.target.value)} />
          <select className="rounded-xl border px-3 py-2" value={category} onChange={e=>setCategory(e.target.value)}>
            {categories.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
          <NumberInput className="rounded-xl border px-3 py-2" placeholder="Amount" value={amount} onChange={setAmount} />
          <button className="rounded-xl bg-black text-white px-3 py-2 hover:opacity-90" onClick={addEntry}>Add win</button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white/80 p-2">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-600"><tr><th className="py-2 px-2">When</th><th className="px-2">Instead of</th><th className="px-2">I did</th><th className="px-2">Category</th><th className="px-2">Saved</th><th></th></tr></thead>
          <tbody>
            {monthEntries.sort((a,b)=>a.timestamp.localeCompare(b.timestamp)).map((e)=> (
              <tr key={e.id} className="border-t">
                <td className="py-2 px-2 whitespace-nowrap">{new Date(e.timestamp).toLocaleString()}</td>
                <td className="px-2">{e.instead_of}</td>
                <td className="px-2">{e.i_did}</td>
                <td className="px-2">{e.category}</td>
                <td className="px-2 font-semibold">{currencyFormat(e.amount_saved)}</td>
                <td className="text-right px-2"><button className="text-xs text-rose-600" onClick={()=>remove(e.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


