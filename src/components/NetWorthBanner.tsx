import { currencyFormat } from '../lib/format'

export function NetWorthBanner({ totals, folderHandle, folderPath, saveStatus }: any) {
  return (
    <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg border border-emerald-300/30 mb-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide opacity-90">Current net worth</div>
          <div className="text-4xl md:text-5xl font-bold mt-1">{currencyFormat(totals.netWorth)}</div>
          {typeof totals.strictNetWorth === 'number' && (
            <div className="mt-2 text-sm opacity-95">
              <span className="font-medium">Strict net worth</span>: {currencyFormat(totals.strictNetWorth)}
              <span className="ml-2 opacity-80">(excludes housing)</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/15 px-4 py-3">
            <div className="text-xs opacity-90">Assets</div>
            <div className="text-xl font-semibold">{currencyFormat(totals.assetUSD)}</div>
          </div>
          <div className="rounded-2xl bg-white/15 px-4 py-3">
            <div className="text-xs opacity-90">Liabilities</div>
            <div className="text-xl font-semibold">{currencyFormat(totals.liabUSD)}</div>
          </div>
          <div className="rounded-2xl bg-white/15 px-4 py-3">
            <div className="text-xs opacity-90">Trivial spend (0.01%)</div>
            <div className="text-xl font-semibold">{currencyFormat(Math.max(0, totals.netWorth * 0.0001))}</div>
          </div>
        </div>
      </div>
      <div className="mt-3 text-emerald-50 text-sm">
        CSV mode: {folderHandle ? <span className="font-medium">connected</span> : <span className="font-medium">not connected</span>}
        {folderPath && <span className="ml-2">• Folder: <span className="font-medium">{folderPath}</span></span>}
        {saveStatus && <span className="ml-2">• {saveStatus}</span>}
      </div>
    </div>
  )
}
