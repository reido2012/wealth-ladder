import { HelpCircle } from 'lucide-react'

export function InstructionsCard() {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between">
        <div className="font-semibold flex items-center gap-2">
          <HelpCircle size={18} /> How to use
        </div>
      </div>
      <ol className="mt-2 list-decimal pl-5 space-y-1 text-sm text-slate-700">
        <li>Click <span className="font-medium">Choose folder</span> to link a local directory. If unsupported, use the CSV buttons instead.</li>
        <li>Enter your <span className="font-medium">assets</span>, <span className="font-medium">liabilities</span>, and <span className="font-medium">fixed costs</span>. Set <span className="font-medium">income</span>, horizon, and return.</li>
        <li>Toggle <span className="font-medium">savings scenarios</span> to compare plans.</li>
        <li>For each month, set a <span className="font-medium">plan save</span>. At month end, click <span className="font-medium">Snapshot</span> to capture the actual change and celebrate wins.</li>
        <li>Use the <span className="font-medium">Anti-Spending</span> tab to log smart choices (e.g., “Instead of Uber Eats → cooked at home, saved $20”).</li>
        <li>Click <span className="font-medium">Save all</span> to write CSVs to your folder.</li>
      </ol>
    </div>
  )
}
