import { Plus, Trash2 } from 'lucide-react'
import { currencyFormat, convertToUSD, num, uid } from '../lib/format'
import { NumberInput } from './NumberInput'
import type { Row } from '../types'

export function RowEditor({ rows, setRows, title, gbpRate }: { rows: Row[]; setRows: (r: Row[]) => void; title: string; gbpRate: number }) {
  const totalUSD = rows.reduce((sum, r) => sum + convertToUSD(num(r.amount), r.currency, gbpRate), 0);
  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl p-4 shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button
          onClick={() => setRows([...rows, { id: uid(), name: '', amount: 0, currency: 'USD' }])}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black text-white hover:opacity-90"
        >
          <Plus size={16} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {rows.map((r, idx) => (
          <div key={r.id} className="grid grid-cols-12 gap-2 items-center">
            <input
              className="col-span-5 rounded-xl border px-3 py-2"
              placeholder="Name"
              value={r.name}
              onChange={(e) => {
                const copy = [...rows];
                copy[idx] = { ...r, name: e.target.value };
                setRows(copy);
              }}
            />
            <NumberInput
              className="col-span-3 rounded-xl border px-3 py-2"
              placeholder="Amount"
              value={r.amount}
              onChange={(val) => {
                const copy = [...rows];
                copy[idx] = { ...r, amount: val };
                setRows(copy);
              }}
            />
            <select
              className="col-span-2 rounded-xl border px-3 py-2"
              value={r.currency}
              onChange={(e) => {
                const copy = [...rows];
                copy[idx] = { ...r, currency: e.target.value as Row['currency'] };
                setRows(copy);
              }}
            >
              <option>USD</option>
              <option>GBP</option>
            </select>
            <div className="col-span-1 text-sm text-gray-600">
              {currencyFormat(convertToUSD(num(r.amount), r.currency, gbpRate))}
            </div>
            <button
              className="col-span-1 justify-self-end text-red-600 hover:text-red-800"
              onClick={() => setRows(rows.filter((x) => x.id !== r.id))}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 text-right text-sm text-gray-700">
        Total: <span className="font-semibold">{currencyFormat(totalUSD)}</span>
      </div>
    </div>
  );
}
