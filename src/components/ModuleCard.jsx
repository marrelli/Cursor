import {
  Activity,
  BarChart2,
  Bell,
  BookOpen,
  Code2,
  Cpu,
  ClipboardList,
  DollarSign,
  GitBranch,
  GitMerge,
  Layers,
  Lock,
  MessageSquare,
  Network,
  PackageCheck,
  PenTool,
  Plug,
  RefreshCw,
  Scale,
  SearchCode,
  ShieldAlert,
  ShieldCheck,
  Star,
  UserCheck,
  Wrench,
  Zap,
} from 'lucide-react'

const moduleIcons = {
  Activity,
  BarChart2,
  Bell,
  BookOpen,
  Code2,
  Cpu,
  ClipboardList,
  DollarSign,
  GitBranch,
  GitMerge,
  Layers,
  Lock,
  MessageSquare,
  Network,
  PackageCheck,
  PenTool,
  Plug,
  RefreshCw,
  Scale,
  SearchCode,
  ShieldAlert,
  ShieldCheck,
  Star,
  UserCheck,
  Wrench,
  Zap,
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const normalizeHex = (hex) => {
  const clean = hex.replace('#', '')

  if (clean.length === 3) {
    return clean
      .split('')
      .map((char) => `${char}${char}`)
      .join('')
  }

  return clean
}

const hexToRgb = (hex) => {
  const normalized = normalizeHex(hex)
  const bigint = Number.parseInt(normalized, 16)

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

const hexToRgba = (hex, alpha) => {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const lightenHex = (hex, amount = 0.14) => {
  const { r, g, b } = hexToRgb(hex)
  const factor = clamp(amount, 0, 1)
  const toLight = (channel) => Math.round(channel + (255 - channel) * factor)

  const value = (toLight(r) << 16) + (toLight(g) << 8) + toLight(b)
  return `#${value.toString(16).padStart(6, '0')}`
}

function ModuleCard({ module, layerColor, isActive, onSelect, registerCardRef }) {
  const Icon = moduleIcons[module.icon] ?? Layers
  const cardColor = lightenHex(layerColor, 0.12)
  const baseShadow = '0 10px 18px rgba(0, 0, 0, 0.24)'
  const hoverShadow = `0 12px 24px rgba(0, 0, 0, 0.34), 0 0 20px ${hexToRgba(layerColor, 0.42)}`
  const activeShadow = `0 16px 30px rgba(0, 0, 0, 0.4), 0 0 26px ${hexToRgba(layerColor, 0.62)}`

  return (
    <button
      ref={(element) => registerCardRef(module.id, element)}
      type="button"
      data-module-card="true"
      data-module-id={module.id}
      aria-pressed={isActive}
      aria-label={module.name}
      onClick={() => onSelect(module.id)}
      className={`module-card h-full w-full rounded-lg border-2 px-3 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1117] ${
        isActive ? 'module-card-active border-white/90' : 'border-transparent'
      }`}
      style={{
        backgroundColor: cardColor,
        boxShadow: isActive ? activeShadow : baseShadow,
        '--hover-shadow': hoverShadow,
        '--active-shadow': activeShadow,
      }}
    >
      <Icon aria-hidden="true" size={16} className="text-white" />
      <span className="mt-2 block truncate text-[13px] font-medium leading-[1.25rem] text-white" title={module.name}>
        {module.name}
      </span>
    </button>
  )
}

export default ModuleCard
