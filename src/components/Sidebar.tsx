import { BarChart2, Target, Heart, ChevronLeft, ChevronRight } from 'lucide-react'

export function Sidebar({ active, setActive, open, setOpen }: { active: 'net' | 'anti' | 'guilt'; setActive: (t: 'net' | 'anti' | 'guilt') => void; open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <div className={`${open ? 'w-52' : 'w-12'} transition-all duration-200 shrink-0 border-r bg-white/70 backdrop-blur`}> 
      <div className="h-14 flex items-center justify-between px-2">
        {open && <div className="text-sm font-semibold px-2">Navigator</div>}
        <button className="p-1 rounded hover:bg-slate-100" onClick={()=>setOpen(!open)} aria-label="Toggle sidebar">
          {open ? <ChevronLeft size={18}/> : <ChevronRight size={18}/>}
        </button>
      </div>
      <nav className="py-2">
        <button
          onClick={()=>setActive('net')}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${active==='net'?'bg-emerald-100 text-emerald-800':'hover:bg-slate-100'}`}
        >
          <BarChart2 size={16} /> {open && <span>Net Worth</span>}
        </button>
        <button
          onClick={()=>setActive('anti')}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${active==='anti'?'bg-blue-100 text-blue-800':'hover:bg-slate-100'}`}
        >
          <Target size={16} /> {open && <span>Anti-Spending</span>}
        </button>
        <button
          onClick={()=>setActive('guilt')}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${active==='guilt'?'bg-purple-100 text-purple-800':'hover:bg-slate-100'}`}
        >
          <Heart size={16} /> {open && <span>Guilt-Free</span>}
        </button>
      </nav>
    </div>
  )
}


