import { X } from 'lucide-react'

function DrillDownPanel({ module, layer, isContentVisible, onClose, panelHeaderRef }) {
  if (!module || !layer) {
    return <div className="h-full w-full" aria-hidden="true" />
  }

  return (
    <aside className="h-full w-full bg-slate-50">
      <div
        className={`panel-content h-full overflow-y-auto p-6 transition-opacity duration-150 ease-linear ${
          isContentVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-1 h-16 w-1 shrink-0 rounded-full" style={{ backgroundColor: layer.color }} aria-hidden="true" />
            <div className="min-w-0">
              <h2
                ref={panelHeaderRef}
                tabIndex={-1}
                className="text-[22px] leading-tight font-bold text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-slate-700/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
              >
                {module.name}
              </h2>
              <p className="mt-1 text-[13px] font-medium text-slate-500">
                Layer {layer.order} - {layer.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700/70"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-7 space-y-6">
          <section>
            <h3 className="text-[15px] font-semibold text-slate-900">What it is</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{module.description}</p>
          </section>

          <section>
            <h3 className="text-[15px] font-semibold text-slate-900">Key Capabilities</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700">
              {module.capabilities.map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-[15px] font-semibold text-slate-900">Why it Matters</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{module.whyItMatters}</p>
          </section>
        </div>
      </div>
    </aside>
  )
}

export default DrillDownPanel
