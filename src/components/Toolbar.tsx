import { FolderOpen, Save, Download } from 'lucide-react'

export function Toolbar({ chooseFolder, saveAllToFolder, exportPlanActualCSV }: any) {
  return (
    <div className="hidden md:flex items-center gap-2">
      <button onClick={chooseFolder} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-slate-50">
        <FolderOpen size={16} /> Choose folder
      </button>
      <button onClick={saveAllToFolder} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-slate-50">
        <Save size={16} /> Save all
      </button>
      <button onClick={exportPlanActualCSV} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-slate-50">
        <Download size={16} /> Plan CSV
      </button>
    </div>
  )
}
