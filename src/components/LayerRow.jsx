import { Bot, Brain, Database, Monitor, Shield, TrendingUp, Workflow } from 'lucide-react'
import ModuleCard from './ModuleCard'

const layerIcons = {
  Bot,
  Brain,
  Database,
  Monitor,
  Shield,
  TrendingUp,
  Workflow,
}

function LayerRow({ layer, layerModules, selectedModuleId, onModuleSelect, registerCardRef, animationDelayMs }) {
  const LayerIcon = layerIcons[layer.icon] ?? Database

  return (
    <section
      aria-label={`Layer ${layer.order}: ${layer.name}`}
      className="layer-row-enter flex min-h-[84px] flex-1 items-stretch gap-3 border-t border-white/8 px-4 py-2 first:border-t-0 md:px-5"
      style={{ animationDelay: `${animationDelayMs}ms` }}
    >
      <div className="layer-label min-w-[220px] max-w-[220px] items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
        <LayerIcon aria-hidden="true" size={16} className="shrink-0 text-white/90" />
        <div className="min-w-0">
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-white/60">Layer {layer.order}</p>
          <p className="truncate text-[13px] font-medium text-white/95">{layer.name}</p>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div
          className="grid h-full gap-3"
          style={{
            gridTemplateColumns: `repeat(${layerModules.length}, minmax(0, 1fr))`,
          }}
        >
          {layerModules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              layerColor={layer.color}
              isActive={selectedModuleId === module.id}
              onSelect={onModuleSelect}
              registerCardRef={registerCardRef}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default LayerRow
