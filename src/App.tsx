import React, { useMemo, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts'
import { TrendingUp, DollarSign, Calendar, AlertTriangle, Info, Target, CheckCircle2, AlertCircle, Circle, Camera } from 'lucide-react'

import { Toolbar } from './components/Toolbar'
import { NetWorthBanner } from './components/NetWorthBanner'
import { WealthLevelCard } from './components/WealthLevelCard'
import { InstructionsCard } from './components/InstructionsCard'
import { RowEditor } from './components/RowEditor'
import { Sidebar } from './components/Sidebar'
import { AntiSpendingTab } from './components/AntiSpendingTab'
import { GuiltFreeTab } from './components/GuiltFreeTab'
import { NetWorthTab } from './components/NetWorthTab'
import { CelebrationModal } from './components/CelebrationModal'
import { NumberInput } from './components/NumberInput'

import { currencyFormat, num, uid, convertToUSD, formatNumberWithCommas, parseCommaNumber } from './lib/format'
import { toCSV, parseCSV } from './lib/csv'
import { simulateGrowth, monthsToTarget, monthKey, nextMonthKey } from './lib/math'
import type { Row, MonthEntry, SnapshotRow, AntiSpendEntry, GuiltFreeData, MonthlyNetWorthData } from './types'

const defaultScenarios = [3500, 4000, 4250, 5000]

const starterAssets: Row[] = [{ id: uid(), name: 'Cash (UK)', amount: 20000, currency: 'GBP' }]
const starterLiabilities: Row[] = []
const starterFixed: Row[] = [
  { id: uid(), name: 'Patreon', amount: 5.39, currency: 'GBP' },
  { id: uid(), name: 'Phone US (billed in GBP)', amount: 50, currency: 'GBP' },
  { id: uid(), name: 'iCloud', amount: 8.99, currency: 'GBP' },
  { id: uid(), name: 'YouTube Premium', amount: 9.5, currency: 'GBP' },
  { id: uid(), name: 'Phone UK', amount: 16, currency: 'GBP' },
  { id: uid(), name: 'Whoop', amount: 0, currency: 'GBP' },
  { id: uid(), name: 'Travel', amount: 70, currency: 'GBP' },
  { id: uid(), name: 'Random Buffer', amount: 50, currency: 'GBP' },
  { id: uid(), name: 'Soho House', amount: 100, currency: 'GBP' },
  { id: uid(), name: 'Groceries', amount: 400, currency: 'GBP' },
  { id: uid(), name: 'Mortgage + service charge', amount: 154.58, currency: 'GBP' },
  { id: uid(), name: 'Gym', amount: 15, currency: 'GBP' },
  { id: uid(), name: 'Rent US', amount: 1191, currency: 'USD' },
  { id: uid(), name: 'Reid Family Droplets', amount: 20, currency: 'GBP' },
  { id: uid(), name: 'House Bills', amount: 300, currency: 'GBP' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<'net'|'anti'|'guilt'>('net')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [gbpRate, setGbpRate] = useState(1.3443542)
  const [income, setIncome] = useState(8000)
  const [assets, setAssets] = useState<Row[]>(starterAssets)
  const [liabs, setLiabs] = useState<Row[]>(starterLiabilities)
  const [fixed, setFixed] = useState<Row[]>(starterFixed)

  const [months, setMonths] = useState(24)
  const [annualReturn, setAnnualReturn] = useState(0.05)

  const [scenarios, setScenarios] = useState<{ amount: number; on: boolean }[]>(defaultScenarios.map((a) => ({ amount: a, on: true })))
  const [customScenario, setCustomScenario] = useState(0)

  const todayKey = monthKey(new Date())
  const [entries, setEntries] = useState<MonthEntry[]>([{ id: uid(), month: todayKey, planSave: 4000 }])
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([])
  const [antiEntries, setAntiEntries] = useState<AntiSpendEntry[]>([])
  const [guiltFreeData, setGuiltFreeData] = useState<GuiltFreeData[]>([])
  const [monthlyNetWorthData, setMonthlyNetWorthData] = useState<MonthlyNetWorthData[]>([])

  const [celebrateOpen, setCelebrateOpen] = useState(false)

  const [folderHandle, setFolderHandle] = useState<any>(null)
  const [folderPath, setFolderPath] = useState<string>('')
  const [saveStatus, setSaveStatus] = useState<string>('')

  // Load cached folder on app startup
  React.useEffect(() => {
    async function loadCachedFolder() {
      try {
        const cachedId = localStorage.getItem('cached-folder-id')
        if (!cachedId) return

        const cachedInfo = localStorage.getItem(cachedId)
        if (!cachedInfo) return

        const { name } = JSON.parse(cachedInfo)
        
        // Try to get the handle from IndexedDB
        const request = indexedDB.open('net-worth-planner', 1)
        request.onsuccess = async () => {
          try {
            const db = request.result
            const transaction = db.transaction(['folders'], 'readonly')
            const store = transaction.objectStore('folders')
            const getRequest = store.get(cachedId)
            
            getRequest.onsuccess = async () => {
              const handle = getRequest.result
              if (handle) {
                // Verify we still have permission to access this folder
                const permission = await handle.queryPermission({ mode: 'readwrite' })
                if (permission === 'granted' || permission === 'prompt') {
                  if (permission === 'prompt') {
                    const newPermission = await handle.requestPermission({ mode: 'readwrite' })
                    if (newPermission !== 'granted') return
                  }
                  
                  setFolderHandle(handle)
                  setFolderPath(name)
                  setSaveStatus('Auto-loaded from cache')
                  setTimeout(() => setSaveStatus(''), 2200)
                  await loadFromFolder(handle)
                }
              }
            }
          } catch (error) {
            console.warn('Failed to load cached folder:', error)
          }
        }
      } catch (error) {
        console.warn('Failed to load cached folder:', error)
      }
    }
    
    loadCachedFolder()
  }, [])

  const totals = useMemo(() => {
    const assetUSD = assets.reduce((sum, r) => sum + convertToUSD(num(r.amount), r.currency, gbpRate), 0)
    const liabUSD = liabs.reduce((sum, r) => sum + convertToUSD(num(r.amount), r.currency, gbpRate), 0)
    const fixedUSD = fixed.reduce((sum, r) => sum + convertToUSD(num(r.amount), r.currency, gbpRate), 0)
    return { assetUSD, liabUSD, fixedUSD, netWorth: assetUSD - liabUSD }
  }, [assets, liabs, fixed, gbpRate])
  const leftover = useMemo(() => income - totals.fixedUSD, [income, totals.fixedUSD])

  const datasets = useMemo(() => {
    const start = totals.netWorth
    const active = scenarios.filter((s) => s.on)
    const lines = active.map((s) => ({
      label: `$${s.amount}/mo`,
      data: simulateGrowth({ startUSD: start, monthlyContribution: s.amount, months, annualReturn }),
      amount: s.amount,
    }))
    const maxLen = Math.max(0, ...lines.map((l) => l.data.length))
    const combined: any[] = []
    for (let i = 0; i < maxLen; i++) {
      const row: any = { month: i }
      lines.forEach((l) => { const p = l.data[i]; if (p) row[l.label] = p.balance })
      combined.push(row)
    }
    const to100 = active.map((s) => ({ amount: s.amount, months: monthsToTarget(totals.netWorth, s.amount, 100000, annualReturn) }))
    return { lines, combined, to100 }
  }, [scenarios, totals.netWorth, months, annualReturn])

  const startNW = totals.netWorth
  const sortedEntries = [...entries].sort((a, b) => a.month.localeCompare(b.month))
  const cumPlan = sortedEntries.reduce((acc: number[], e, i) => { acc[i] = (acc[i-1] || 0) + num(e.planSave); return acc }, [])
  const cumActual = sortedEntries.reduce((acc: number[], e, i) => { acc[i] = (acc[i-1] || 0) + num(e.actualSave); return acc }, [])
  const planVsActualData = sortedEntries.map((e, i) => ({ label: e.month, Plan: startNW + (cumPlan[i] || 0), Actual: startNW + (cumActual[i] || 0) }))
  const averageActualSave = (() => {
    const vals = sortedEntries.map((e) => num(e.actualSave)).filter((v) => v > 0)
    if (!vals.length) return 0
    return vals.reduce((a, b) => a + b, 0) / vals.length
  })()
  const monthsTo100kAtActual = monthsToTarget(startNW, averageActualSave || 0, 100000, 0)

  function statusFor(e: MonthEntry) {
    if (e.actualSave == null || isNaN(Number(e.actualSave))) return { label: 'pending', color: 'text-slate-500', icon: Circle } as const
    if (e.actualSave >= e.planSave) return { label: 'on track', color: 'text-emerald-600', icon: CheckCircle2 } as const
    if (e.actualSave >= 0.8 * e.planSave) return { label: 'at risk', color: 'text-amber-600', icon: AlertTriangle } as const
    return { label: 'off track', color: 'text-rose-600', icon: AlertCircle } as const
  }

  async function readTextFile(dir: any, name: string): Promise<string | null> {
    try { const fh = await dir.getFileHandle(name, { create: false }); const file = await fh.getFile(); return await file.text(); }
    catch { return null }
  }
  async function writeTextFile(dir: any, name: string, text: string) {
    const fh = await dir.getFileHandle(name, { create: true }); const ws = await fh.createWritable(); await ws.write(text); await ws.close()
  }
  async function chooseFolder() {
    const picker = (window as any).showDirectoryPicker
    if (!picker) { alert('Your browser does not support local folder access. Use Chrome or Edge.'); return }
    const dir = await picker()
    setFolderHandle(dir)
    setFolderPath(dir.name)
    // Cache the folder handle for next session
    try {
      const handleId = `folder-handle-${Date.now()}`
      localStorage.setItem('cached-folder-id', handleId)
      localStorage.setItem(handleId, JSON.stringify({ name: dir.name, timestamp: Date.now() }))
      // Store the actual handle in IndexedDB for persistence across sessions
      const request = indexedDB.open('net-worth-planner', 1)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('folders')) {
          db.createObjectStore('folders')
        }
      }
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['folders'], 'readwrite')
        const store = transaction.objectStore('folders')
        store.put(dir, handleId)
      }
    } catch (error) {
      console.warn('Failed to cache folder handle:', error)
    }
    await loadFromFolder(dir)
  }
  async function loadFromFolder(dir: any) {
    // Try to load new monthly format first
    const monthlyNwTxt = await readTextFile(dir, 'monthly_net_worth.csv')
    if (monthlyNwTxt) {
      const { headers, rows } = parseCSV(monthlyNwTxt)
      const out: MonthlyNetWorthData[] = rows.map((r) => ({
        month: r[headers.indexOf('month')] || todayKey,
        assets: JSON.parse(r[headers.indexOf('assets')] || '[]'),
        liabilities: JSON.parse(r[headers.indexOf('liabilities')] || '[]'),
        fixedCosts: JSON.parse(r[headers.indexOf('fixed_costs')] || '[]'),
        settings: JSON.parse(r[headers.indexOf('settings')] || '{}'),
        scenarios: JSON.parse(r[headers.indexOf('scenarios')] || '[]')
      }))
      if (out.length) setMonthlyNetWorthData(out)
    } else {
      // Fallback: Load old format and migrate to monthly format
      let migratedSettings = { income, gbpRate, annualReturn, months }
      let migratedAssets = assets
      let migratedLiabilities = liabs  
      let migratedFixed = fixed
      let migratedScenarios = scenarios

      const settingsTxt = await readTextFile(dir, 'settings.csv')
      if (settingsTxt) {
        const { headers, rows } = parseCSV(settingsTxt)
        const get = (k: string) => { const idx = headers.indexOf(k); return idx >= 0 && rows[0] ? rows[0][idx] : '' }
        migratedSettings = {
          income: num(get('monthly_income_after_tax')) || income,
          gbpRate: num(get('gbp_usd_rate')) || gbpRate,
          annualReturn: (num(get('annual_return_pct')) || 5) / 100,
          months: num(get('horizon_months')) || months
        }
      }

      const assetsTxt = await readTextFile(dir, 'assets.csv')
      if (assetsTxt) {
        const { headers, rows } = parseCSV(assetsTxt)
        const out: Row[] = rows.map((r) => ({ 
          id: r[headers.indexOf('id')] || uid(), 
          name: r[headers.indexOf('name')] || '', 
          amount: num(r[headers.indexOf('amount')]), 
          currency: (r[headers.indexOf('currency')] as any) || 'USD', 
          category: r[headers.indexOf('category')] || '' 
        }))
        if (out.length) migratedAssets = out
      }

      const liabTxt = await readTextFile(dir, 'liabilities.csv')
      if (liabTxt) {
        const { headers, rows } = parseCSV(liabTxt)
        const out: Row[] = rows.map((r) => ({ 
          id: r[headers.indexOf('id')] || uid(), 
          name: r[headers.indexOf('name')] || '', 
          amount: num(r[headers.indexOf('amount')]), 
          currency: (r[headers.indexOf('currency')] as any) || 'USD', 
          category: r[headers.indexOf('category')] || '' 
        }))
        if (out.length) migratedLiabilities = out
      }

      const fixedTxt = await readTextFile(dir, 'fixed_costs.csv')
      if (fixedTxt) {
        const { headers, rows } = parseCSV(fixedTxt)
        const out: Row[] = rows.map((r) => ({ 
          id: r[headers.indexOf('id')] || uid(), 
          name: r[headers.indexOf('name')] || '', 
          amount: num(r[headers.indexOf('amount')]), 
          currency: (r[headers.indexOf('currency')] as any) || 'USD', 
          category: r[headers.indexOf('category')] || '', 
          cadence: r[headers.indexOf('cadence')] || 'monthly' 
        }))
        if (out.length) migratedFixed = out
      }

      const scenTxt = await readTextFile(dir, 'scenarios.csv')
      if (scenTxt) {
        const { headers, rows } = parseCSV(scenTxt)
        const out = rows.map((r) => ({ 
          amount: num(r[headers.indexOf('amount')]), 
          on: (r[headers.indexOf('on')] || 'true') === 'true' 
        }))
        if (out.length) migratedScenarios = out
      }

      // Create monthly snapshot from migrated data
      const migratedMonthlyData: MonthlyNetWorthData = {
        month: todayKey,
        assets: migratedAssets,
        liabilities: migratedLiabilities,
        fixedCosts: migratedFixed,
        settings: migratedSettings,
        scenarios: migratedScenarios
      }
      setMonthlyNetWorthData([migratedMonthlyData])

      // Update global state for backward compatibility
      setGbpRate(migratedSettings.gbpRate)
      setIncome(migratedSettings.income)
      setAnnualReturn(migratedSettings.annualReturn)
      setMonths(migratedSettings.months)
      setAssets(migratedAssets)
      setLiabs(migratedLiabilities)
      setFixed(migratedFixed)
      setScenarios(migratedScenarios)
    }

    const paTxt = await readTextFile(dir, 'plan_actual.csv')
    if (paTxt) {
      const { headers, rows } = parseCSV(paTxt)
      const out: MonthEntry[] = rows.map((r) => ({ id: uid(), month: r[headers.indexOf('month')] || todayKey, planSave: num(r[headers.indexOf('plan_save')]), actualSave: r[headers.indexOf('actual_save')] ? num(r[headers.indexOf('actual_save')]) : undefined, actualNetWorth: r[headers.indexOf('actual_net_worth')] ? num(r[headers.indexOf('actual_net_worth')]) : undefined, note: r[headers.indexOf('note')] || '' }))
      if (out.length) setEntries(out)
    }
    const snapTxt = await readTextFile(dir, 'snapshots.csv')
    if (snapTxt) {
      const { headers, rows } = parseCSV(snapTxt)
      const out: SnapshotRow[] = rows.map((r) => ({ month: r[headers.indexOf('month')], asset_total_usd: num(r[headers.indexOf('asset_total_usd')]), liability_total_usd: num(r[headers.indexOf('liability_total_usd')]), net_worth_usd: num(r[headers.indexOf('net_worth_usd')]), gbp_usd_rate: num(r[headers.indexOf('gbp_usd_rate')]) }))
      if (out.length) setSnapshots(out)
    }
    const antiTxt = await readTextFile(dir, 'anti_spending.csv')
    if (antiTxt) {
      const { headers, rows } = parseCSV(antiTxt)
      const out: AntiSpendEntry[] = rows.map((r)=>({
        id: r[headers.indexOf('id')] || uid(),
        month: r[headers.indexOf('month')] || todayKey,
        timestamp: r[headers.indexOf('timestamp')] || new Date().toISOString(),
        instead_of: r[headers.indexOf('instead_of')] || '',
        i_did: r[headers.indexOf('i_did')] || '',
        category: r[headers.indexOf('category')] || 'Other',
        amount_saved: num(r[headers.indexOf('amount_saved')])
      }))
      if (out.length) setAntiEntries(out)
    }
    const guiltTxt = await readTextFile(dir, 'guilt_free.csv')
    if (guiltTxt) {
      const { headers, rows } = parseCSV(guiltTxt)
      const out: GuiltFreeData[] = rows.map((r) => ({
        month: r[headers.indexOf('month')] || todayKey,
        takeHomePay: num(r[headers.indexOf('take_home_pay')]),
        savingsGoals: JSON.parse(r[headers.indexOf('savings_goals')] || '[]')
      }))
      if (out.length) setGuiltFreeData(out)
    }
    setSaveStatus('Loaded CSVs from folder'); setTimeout(() => setSaveStatus(''), 2200)
  }
  async function saveAllToFolder() {
    if (!folderHandle) { alert('Choose a folder first'); return }
    const settingsHeaders = ['base_currency','gbp_usd_rate','monthly_income_after_tax','annual_return_pct','horizon_months']
    const settingsRows = [['USD', gbpRate, income, (annualReturn*100).toFixed(2), months]]
    await writeTextFile(folderHandle, 'settings.csv', toCSV(settingsHeaders, settingsRows))

    const assetHeaders = ['id','name','category','currency','amount','last_updated']
    const assetRows = assets.map(a => [a.id, a.name, a.category||'', a.currency, a.amount, new Date().toISOString().slice(0,10)])
    await writeTextFile(folderHandle, 'assets.csv', toCSV(assetHeaders, assetRows))

    const liabHeaders = ['id','name','category','currency','amount','last_updated']
    const liabRows = liabs.map(l => [l.id, l.name, l.category||'', l.currency, l.amount, new Date().toISOString().slice(0,10)])
    await writeTextFile(folderHandle, 'liabilities.csv', toCSV(liabHeaders, liabRows))

    const fixedHeaders = ['id','name','category','currency','amount','cadence','start_date','end_date','active']
    const fixedRows = fixed.map(f => [f.id, f.name, f.category||'', f.currency, f.amount, f.cadence||'monthly', '', '', 'true'])
    await writeTextFile(folderHandle, 'fixed_costs.csv', toCSV(fixedHeaders, fixedRows))

    const scenHeaders = ['amount','on']
    const scenRows = scenarios.map(s => [s.amount, String(s.on)])
    await writeTextFile(folderHandle, 'scenarios.csv', toCSV(scenHeaders, scenRows))

    const paHeaders = ['month','plan_save','actual_save','actual_net_worth','note']
    const paRows = entries.map(e => [e.month, e.planSave, e.actualSave ?? '', e.actualNetWorth ?? '', e.note ?? ''])
    await writeTextFile(folderHandle, 'plan_actual.csv', toCSV(paHeaders, paRows))

    const snapHeaders = ['month','asset_total_usd','liability_total_usd','net_worth_usd','gbp_usd_rate']
    const snapRows = snapshots.map(s => [s.month, s.asset_total_usd, s.liability_total_usd, s.net_worth_usd, s.gbp_usd_rate])
    await writeTextFile(folderHandle, 'snapshots.csv', toCSV(snapHeaders, snapRows))

    const antiHeaders = ['id','month','timestamp','instead_of','i_did','category','amount_saved']
    const antiRows = antiEntries.map(e => [e.id, e.month, e.timestamp, e.instead_of, e.i_did, e.category, e.amount_saved])
    await writeTextFile(folderHandle, 'anti_spending.csv', toCSV(antiHeaders, antiRows))

    const guiltHeaders = ['month','take_home_pay','savings_goals']
    const guiltRows = guiltFreeData.map(g => [g.month, g.takeHomePay, JSON.stringify(g.savingsGoals)])
    await writeTextFile(folderHandle, 'guilt_free.csv', toCSV(guiltHeaders, guiltRows))

    const monthlyNwHeaders = ['month','assets','liabilities','fixed_costs','settings','scenarios']
    const monthlyNwRows = monthlyNetWorthData.map(m => [
      m.month, 
      JSON.stringify(m.assets), 
      JSON.stringify(m.liabilities), 
      JSON.stringify(m.fixedCosts), 
      JSON.stringify(m.settings), 
      JSON.stringify(m.scenarios)
    ])
    await writeTextFile(folderHandle, 'monthly_net_worth.csv', toCSV(monthlyNwHeaders, monthlyNwRows))

    setSaveStatus('Saved all CSVs'); setTimeout(() => setSaveStatus(''), 2200)
  }

  function addNextMonth() {
    const sorted = [...entries].sort((a,b)=>a.month.localeCompare(b.month))
    const last = sorted[sorted.length - 1]
    const next = last ? nextMonthKey(last.month) : todayKey
    setEntries([...entries, { id: uid(), month: next, planSave: leftover > 0 ? Math.floor(leftover) : 0 }])
  }

  function takeSnapshot(monthEntry: MonthEntry, entryIndex: number) {
    const currentNetWorth = totals.netWorth
    
    // Find the most recent snapshot before this month to calculate actual savings
    const sortedSnapshots = [...snapshots].sort((a, b) => a.month.localeCompare(b.month))
    const previousSnapshot = sortedSnapshots
      .filter(s => s.month < monthEntry.month)
      .pop()
    
    const previousNetWorth = previousSnapshot ? previousSnapshot.net_worth_usd : 0
    const actualSave = currentNetWorth - previousNetWorth
    
    // Update the month entry with actual data
    const updatedEntries = [...entries]
    updatedEntries[entryIndex] = {
      ...monthEntry,
      actualSave: Math.round(actualSave),
      actualNetWorth: Math.round(currentNetWorth)
    }
    setEntries(updatedEntries)
    
    // Create or update snapshot
    const existingSnapshotIndex = snapshots.findIndex(s => s.month === monthEntry.month)
    const newSnapshot: SnapshotRow = {
      month: monthEntry.month,
      asset_total_usd: Math.round(totals.assetUSD),
      liability_total_usd: Math.round(totals.liabUSD),
      net_worth_usd: Math.round(currentNetWorth),
      gbp_usd_rate: gbpRate
    }
    
    const updatedSnapshots = [...snapshots]
    if (existingSnapshotIndex >= 0) {
      updatedSnapshots[existingSnapshotIndex] = newSnapshot
    } else {
      updatedSnapshots.push(newSnapshot)
    }
    setSnapshots(updatedSnapshots)
    
    setCelebrateOpen(true)
    setSaveStatus(`Snapshot taken for ${monthEntry.month}`)
    setTimeout(() => setSaveStatus(''), 2200)
  }

  function exportPlanActualCSV() {
    const headers = ['month','planSave','actualSave','actualNetWorth']
    const rows = [...entries].sort((a,b)=>a.month.localeCompare(b.month)).map(e => [e.month, e.planSave, e.actualSave ?? '', e.actualNetWorth ?? ''])
    const csv = toCSV(headers, rows)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'plan_vs_actual.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const currentMonth = todayKey
  const antiMonthTotal = useMemo(()=> antiEntries.filter(e=>e.month===currentMonth).reduce((s,e)=>s+e.amount_saved,0), [antiEntries, currentMonth])
  const antiMonthCount = useMemo(()=> antiEntries.filter(e=>e.month===currentMonth).length, [antiEntries, currentMonth])

  // Initialize monthly data with current data if not exists
  React.useEffect(() => {
    if (monthlyNetWorthData.length === 0) {
      const currentMonthData: MonthlyNetWorthData = {
        month: currentMonth,
        assets,
        liabilities: liabs,
        fixedCosts: fixed,
        settings: { income, gbpRate, annualReturn, months },
        scenarios
      }
      setMonthlyNetWorthData([currentMonthData])
    }
  }, [assets, liabs, fixed, income, gbpRate, annualReturn, months, scenarios, currentMonth, monthlyNetWorthData.length])

  // Get current month data or create default
  const getCurrentMonthData = (month: string): MonthlyNetWorthData => {
    const existing = monthlyNetWorthData.find(d => d.month === month)
    if (existing) return existing

    const currentMonthKey = monthKey(new Date())
    
    // For current month or future months, auto-copy from most recent data
    if (month >= currentMonthKey) {
      const sortedData = [...monthlyNetWorthData].sort((a, b) => a.month.localeCompare(b.month))
      const mostRecentMonth = sortedData[sortedData.length - 1]
      
      return mostRecentMonth ? {
        ...mostRecentMonth,
        month
      } : {
        month,
        assets,
        liabilities: liabs,
        fixedCosts: fixed,
        settings: { income, gbpRate, annualReturn, months },
        scenarios
      }
    }
    
    // For historical months (past), start with empty data
    return {
      month,
      assets: [],
      liabilities: [],
      fixedCosts: [],
      settings: { 
        income: 0, 
        gbpRate: 1.3443542, 
        annualReturn: 0.05, 
        months: 24 
      },
      scenarios: []
    }
  }

  const updateMonthlyData = (month: string, updates: Partial<MonthlyNetWorthData>) => {
    const currentData = getCurrentMonthData(month)
    const updatedData = { ...currentData, ...updates, month }
    
    const newData = monthlyNetWorthData.filter(d => d.month !== month)
    newData.push(updatedData)
    setMonthlyNetWorthData(newData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-4">
        <Sidebar active={activeTab} setActive={setActiveTab} open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="text-emerald-600" /> Net worth and savings planner
          </h1>
          <Toolbar chooseFolder={chooseFolder} saveAllToFolder={saveAllToFolder} exportPlanActualCSV={exportPlanActualCSV} />
        </div>

        {activeTab==='net' ? (
          <NetWorthTab 
            folderHandle={folderHandle} 
            folderPath={folderPath} 
            saveStatus={saveStatus}
            getCurrentMonthData={getCurrentMonthData}
            updateMonthlyData={updateMonthlyData}
            gbpRate={gbpRate}
          >
            {(monthData, updateData) => (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold"><DollarSign size={16}/> Monthly income</div>
            <NumberInput className="w-full mt-2 rounded-xl border px-3 py-2" value={monthData.settings.income} onChange={(val) => updateData({ settings: { ...monthData.settings, income: val } })} />
            <div className="text-xs text-slate-500 mt-2">After tax. Edit as needed.</div>
          </div>
          <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold"><Info size={16}/> GBP to USD rate</div>
            <input type="number" step="0.0001" className="w-full mt-2 rounded-xl border px-3 py-2" value={monthData.settings.gbpRate} onChange={(e)=>updateData({ settings: { ...monthData.settings, gbpRate: num(e.target.value) } })}/>
            <div className="text-xs text-slate-500 mt-2">Used to convert any GBP amounts into USD.</div>
          </div>
          <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold"><Calendar size={16}/> Horizon and return</div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="text-xs">Months</label>
                <input type="number" className="w-full rounded-xl border px-3 py-2" value={monthData.settings.months} onChange={(e)=>updateData({ settings: { ...monthData.settings, months: Math.max(1, Math.floor(num(e.target.value))) } })} />
              </div>
              <div>
                <label className="text-xs">Annual return %</label>
                <input type="number" step="0.1" className="w-full rounded-xl border px-3 py-2" value={monthData.settings.annualReturn*100} onChange={(e)=>updateData({ settings: { ...monthData.settings, annualReturn: num(e.target.value)/100 } })} />
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-2">Return is applied monthly. Set 0 for cash only.</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6">
          <RowEditor rows={monthData.assets} setRows={(rows) => updateData({ assets: rows })} title="Assets" gbpRate={monthData.settings.gbpRate} />
          <RowEditor rows={monthData.liabilities} setRows={(rows) => updateData({ liabilities: rows })} title="Liabilities" gbpRate={monthData.settings.gbpRate} />
        </div>
        <div className="grid grid-cols-1 gap-4 mb-6">
          <RowEditor rows={monthData.fixedCosts} setRows={(rows) => updateData({ fixedCosts: rows })} title="Fixed monthly costs" gbpRate={monthData.settings.gbpRate} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
            <div className="font-semibold mb-2">Savings scenarios</div>
            <div className="space-y-2">
              {monthData.scenarios.map((s, i) => (
                <label key={i} className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={s.on} onChange={(e)=>{ const copy=[...monthData.scenarios]; copy[i] = { ...copy[i], on: e.target.checked }; updateData({ scenarios: copy }) }} />
                    <span>${s.amount}/mo</span>
                  </div>
                  <div className="text-xs text-slate-500">{s.amount <= (monthData.settings.income - monthData.fixedCosts.reduce((sum, r) => sum + (r.currency === 'USD' ? r.amount : r.amount * monthData.settings.gbpRate), 0)) ? 'feasible' : `short by ${currencyFormat(s.amount - (monthData.settings.income - monthData.fixedCosts.reduce((sum, r) => sum + (r.currency === 'USD' ? r.amount : r.amount * monthData.settings.gbpRate), 0)))}`}</div>
                </label>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <NumberInput placeholder="Add amount" className="col-span-2 rounded-xl border px-3 py-2" value={customScenario || ''} onChange={setCustomScenario} />
              <button className="rounded-xl bg-black text-white px-3 py-2 hover:opacity-90" onClick={()=>{ if (!customScenario) return; updateData({ scenarios: [...monthData.scenarios, { amount: Math.floor(customScenario), on: true }] }); setCustomScenario(0); }}>Add</button>
            </div>
            <div className="mt-4 text-sm bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-2"><AlertTriangle size={16} className="text-amber-600"/> Leftover after fixed costs</div>
              <div className="mt-1">Income {currencyFormat(monthData.settings.income)} - fixed costs {currencyFormat(monthData.fixedCosts.reduce((sum, r) => sum + (r.currency === 'USD' ? r.amount : r.amount * monthData.settings.gbpRate), 0))} = <span className="font-semibold">{currencyFormat(monthData.settings.income - monthData.fixedCosts.reduce((sum, r) => sum + (r.currency === 'USD' ? r.amount : r.amount * monthData.settings.gbpRate), 0))}</span></div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white/70 p-4 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Projection</div>
              <div className="text-xs text-slate-500">Start balance {currencyFormat(totals.netWorth)} • Return {Math.round(annualReturn*1000)/10}% • Horizon {months} mo</div>
            </div>
            <div className="h-72 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={datasets.combined} margin={{ left: 12, right: 12, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickFormatter={(v)=>`${v}m`} />
                  <YAxis tickFormatter={(v)=>`$${Math.round(v/1000)}k`} width={60} />
                  <Tooltip formatter={(v:any)=>currencyFormat(v)} labelFormatter={(l)=>`Month ${l}`} />
                  <Legend />
                  <ReferenceLine y={100000} stroke="#888" strokeDasharray="4 4" label="$100k" />
                  {datasets.lines.map((l, idx) => (<Line key={idx} type="monotone" dataKey={l.label} dot={false} strokeWidth={2} />))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-600"><tr><th className="py-2">Scenario</th><th>Months to $100k</th><th>Finish month from now</th></tr></thead>
                <tbody>
                  {datasets.to100.map((r, i) => {
                    const finish = r.months === Infinity ? 'n/a' : `${r.months} mo`;
                    const finishDate = r.months === Infinity ? '' : `~${new Date(new Date().setMonth(new Date().getMonth() + (r.months as number))).toLocaleDateString()}`;
                    return (<tr key={i} className="border-t"><td className="py-2">${r.amount}/mo</td><td>{finish}</td><td>{finishDate}</td></tr>)
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white/80 p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div className="font-semibold flex items-center gap-2"><Target size={18}/> Plan vs Actual (monthly)</div>
            <button 
              onClick={addNextMonth}
              className="px-3 py-1 text-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors"
            >
              + Add Month
            </button>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-600"><tr><th className="py-2">Month</th><th>Plan save</th><th>Actual save</th><th>Status</th><th>Actual net worth</th><th>Note</th><th>Action</th></tr></thead>
              <tbody>
                {sortedEntries.map((e, idx) => {
                  const s = statusFor(e) as any; const Icon = s.icon
                  const sortedEntriesForIndex = [...entries].sort((a,b)=>a.month.localeCompare(b.month))
                  const originalIndex = entries.findIndex(entry => entry.id === e.id)
                  return (
                    <tr key={e.id} className="border-t">
                      <td className="py-2"><input value={e.month} onChange={(ev)=>{ const copy=[...entries]; copy[originalIndex] = { ...e, month: ev.target.value }; setEntries(copy) }} className="rounded-xl border px-2 py-1 w-28" /></td>
                      <td><NumberInput value={e.planSave || 0} onChange={(val)=>{ const copy=[...entries]; copy[originalIndex] = { ...e, planSave: val }; setEntries(copy) }} className="rounded-xl border px-2 py-1 w-28" /></td>
                      <td><NumberInput value={e.actualSave ?? ''} onChange={(val)=>{ const copy=[...entries]; copy[originalIndex] = { ...e, actualSave: val }; setEntries(copy) }} className="rounded-xl border px-2 py-1 w-28" placeholder="enter or snapshot" /></td>
                      <td><span className={`inline-flex items-center gap-1 text-xs ${s.color}`}><Icon size={14}/> {s.label}</span></td>
                      <td><NumberInput value={e.actualNetWorth ?? ''} onChange={(val)=>{ const copy=[...entries]; copy[originalIndex] = { ...e, actualNetWorth: val }; setEntries(copy) }} className="rounded-xl border px-2 py-1 w-32" placeholder="optional" /></td>
                      <td><input value={e.note ?? ''} onChange={(ev)=>{ const copy=[...entries]; copy[originalIndex] = { ...e, note: ev.target.value }; setEntries(copy) }} className="rounded-xl border px-2 py-1 w-40" placeholder="note" /></td>
                      <td className="text-right">
                        <button 
                          onClick={() => takeSnapshot(e, originalIndex)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                          title="Take snapshot of current net worth"
                        >
                          <Camera size={12} />
                          Snapshot
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="h-64 mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={planVsActualData} margin={{ left: 12, right: 12, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(v)=>`$${Math.round(v/1000)}k`} width={60} />
                <Tooltip formatter={(v:any)=>currencyFormat(v)} />
                <Legend />
                <ReferenceLine y={100000} stroke="#888" strokeDasharray="4 4" label="$100k" />
                <Line type="monotone" dataKey="Plan" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="Actual" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 text-sm text-slate-600">
            {averageActualSave > 0 ? (
              <div>At your current actual pace (~{currencyFormat(averageActualSave)} per month), time to $100k is about <span className="font-semibold">{monthsTo100kAtActual === Infinity ? 'n/a' : `${monthsTo100kAtActual} months`}</span> ignoring investment returns.</div>
            ) : (
              <div>Enter actual saves to see pace and variance.</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
            <div className="text-xs uppercase text-slate-500">Summary</div>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Assets: <span className="font-semibold">{currencyFormat(totals.assetUSD)}</span></li>
              <li>Liabilities: <span className="font-semibold">{currencyFormat(totals.liabUSD)}</span></li>
              <li>Net worth: <span className="font-semibold">{currencyFormat(totals.netWorth)}</span></li>
              <li>Fixed costs monthly: <span className="font-semibold">{currencyFormat(totals.fixedUSD)}</span></li>
              <li>Leftover after costs: <span className="font-semibold">{currencyFormat(leftover)}</span></li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
            <div className="text-xs uppercase text-slate-500">Tips</div>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              <li>Use Choose folder to link a local directory. Save all writes CSVs you can keep in Obsidian.</li>
              <li>Set annual return to 0 if you want plan vs actual comparisons unaffected by market swings.</li>
              <li>Export Plan CSV if you just want a quick backup of the plan vs actual table.</li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
            <div className="text-xs uppercase text-slate-500">Notes</div>
            <p className="text-sm mt-2">The File System Access API is supported in Chrome, Edge, Brave, Arc. In Safari or Firefox, use the CSV export buttons as a fallback.</p>
          </div>
        </div>
              </>
            )}
          </NetWorthTab>
        ) : activeTab === 'anti' ? (
          <AntiSpendingTab entries={antiEntries} setEntries={setAntiEntries} />
        ) : (
          <GuiltFreeTab guiltFreeData={guiltFreeData} setGuiltFreeData={setGuiltFreeData} fixedCosts={fixed} gbpRate={gbpRate} />
        )}
        </div>
      </div>
      <CelebrationModal open={celebrateOpen} onClose={()=>setCelebrateOpen(false)} month={currentMonth} netChangeUSD={averageActualSave} antiSavedUSD={antiMonthTotal} antiCount={antiMonthCount} />
    </div>
  )
}
