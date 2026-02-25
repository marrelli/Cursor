import { useEffect, useMemo, useRef, useState } from 'react'
import DrillDownPanel from './components/DrillDownPanel'
import LayerRow from './components/LayerRow'
import { layers } from './data/layers'
import { modules } from './data/modules'

const PANEL_OPEN_MS = 300
const PANEL_CLOSE_MS = 250
const CARD_CLICK_DEBOUNCE_MS = 100
const SWAP_FADE_OUT_MS = 150
const SWAP_GAP_MS = 50
const SWAP_FADE_IN_MS = 150
const SWAP_TOTAL_MS = SWAP_FADE_OUT_MS + SWAP_GAP_MS + SWAP_FADE_IN_MS
const LAYER_STAGGER_MS = 120

function App() {
  const [selectedModuleId, setSelectedModuleId] = useState(null)
  const [displayedModuleId, setDisplayedModuleId] = useState(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isPanelContentVisible, setIsPanelContentVisible] = useState(false)

  const selectedModuleIdRef = useRef(selectedModuleId)
  const displayedModuleIdRef = useRef(displayedModuleId)
  const isPanelOpenRef = useRef(isPanelOpen)

  const isAnimatingRef = useRef(false)
  const queuedActionRef = useRef(null)
  const activeTimersRef = useRef([])
  const cardDebounceTimerRef = useRef(null)
  const requestActionRef = useRef(null)
  const panelHeaderRef = useRef(null)
  const returnFocusCardIdRef = useRef(null)
  const cardElementMapRef = useRef(new Map())

  useEffect(() => {
    selectedModuleIdRef.current = selectedModuleId
  }, [selectedModuleId])

  useEffect(() => {
    displayedModuleIdRef.current = displayedModuleId
  }, [displayedModuleId])

  useEffect(() => {
    isPanelOpenRef.current = isPanelOpen
  }, [isPanelOpen])

  const modulesByLayer = useMemo(() => {
    const grouped = new Map()
    layers.forEach((layer) => grouped.set(layer.id, []))

    modules.forEach((module) => {
      if (grouped.has(module.layerId)) {
        grouped.get(module.layerId).push(module)
      }
    })

    return grouped
  }, [])

  const moduleById = useMemo(() => new Map(modules.map((module) => [module.id, module])), [])
  const layerById = useMemo(() => new Map(layers.map((layer) => [layer.id, layer])), [])

  const displayedModule = displayedModuleId ? moduleById.get(displayedModuleId) ?? null : null
  const displayedLayer = displayedModule ? layerById.get(displayedModule.layerId) ?? null : null

  const focusPanelHeader = () => {
    panelHeaderRef.current?.focus()
  }

  const focusCard = (moduleId) => {
    cardElementMapRef.current.get(moduleId)?.focus()
  }

  const registerCardRef = (moduleId, element) => {
    if (element) {
      cardElementMapRef.current.set(moduleId, element)
      return
    }

    cardElementMapRef.current.delete(moduleId)
  }

  const clearTimerFromRegistry = (timerId) => {
    activeTimersRef.current = activeTimersRef.current.filter((trackedTimerId) => trackedTimerId !== timerId)
  }

  const setManagedTimeout = (callback, delayMs) => {
    const timerId = window.setTimeout(() => {
      clearTimerFromRegistry(timerId)
      callback()
    }, delayMs)

    activeTimersRef.current.push(timerId)
    return timerId
  }

  const beginAnimation = (durationMs, onComplete) => {
    isAnimatingRef.current = true

    setManagedTimeout(() => {
      onComplete?.()
      isAnimatingRef.current = false

      const queuedAction = queuedActionRef.current
      queuedActionRef.current = null
      if (queuedAction) {
        runAction(queuedAction)
      }
    }, durationMs)
  }

  const runAction = (action) => {
    if (action.type === 'close') {
      if (!isPanelOpenRef.current && !displayedModuleIdRef.current) {
        return
      }

      const focusTargetCardId = returnFocusCardIdRef.current ?? selectedModuleIdRef.current

      setIsPanelOpen(false)
      setSelectedModuleId(null)
      setIsPanelContentVisible(false)

      beginAnimation(PANEL_CLOSE_MS, () => {
        setDisplayedModuleId(null)

        if (focusTargetCardId) {
          setManagedTimeout(() => focusCard(focusTargetCardId), 0)
        }
      })
      return
    }

    if (action.type !== 'card') {
      return
    }

    const targetModuleId = action.moduleId
    const currentlySelectedModuleId = selectedModuleIdRef.current

    if (!isPanelOpenRef.current) {
      returnFocusCardIdRef.current = targetModuleId
      setSelectedModuleId(targetModuleId)
      setDisplayedModuleId(targetModuleId)
      setIsPanelOpen(true)
      setIsPanelContentVisible(true)

      beginAnimation(PANEL_OPEN_MS, () => {
        focusPanelHeader()
      })
      return
    }

    if (currentlySelectedModuleId === targetModuleId) {
      runAction({ type: 'close' })
      return
    }

    returnFocusCardIdRef.current = targetModuleId
    setSelectedModuleId(targetModuleId)
    setIsPanelContentVisible(false)

    // Keep the panel shell mounted while fading between module content.
    setManagedTimeout(() => {
      setDisplayedModuleId(targetModuleId)
    }, SWAP_FADE_OUT_MS)

    setManagedTimeout(() => {
      setIsPanelContentVisible(true)
    }, SWAP_FADE_OUT_MS + SWAP_GAP_MS)

    beginAnimation(SWAP_TOTAL_MS)
  }

  const requestAction = (action) => {
    if (isAnimatingRef.current) {
      queuedActionRef.current = action
      return
    }

    runAction(action)
  }

  requestActionRef.current = requestAction

  const handleModuleSelect = (moduleId) => {
    if (cardDebounceTimerRef.current) {
      window.clearTimeout(cardDebounceTimerRef.current)
    }

    cardDebounceTimerRef.current = window.setTimeout(() => {
      cardDebounceTimerRef.current = null
      requestActionRef.current?.({ type: 'card', moduleId })
    }, CARD_CLICK_DEBOUNCE_MS)
  }

  const handleMainArchitectureClick = (event) => {
    if (!isPanelOpenRef.current) {
      return
    }

    if (event.target.closest('[data-module-card="true"]')) {
      return
    }

    requestAction({ type: 'close' })
  }

  const handleClosePanel = () => {
    requestAction({ type: 'close' })
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape' || !isPanelOpenRef.current) {
        return
      }

      event.preventDefault()
      requestActionRef.current?.({ type: 'close' })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    return () => {
      activeTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
      activeTimersRef.current = []

      if (cardDebounceTimerRef.current) {
        window.clearTimeout(cardDebounceTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="app-shell bg-[#0D1117] text-white">
      <header className="fixed top-0 right-0 left-0 z-20 flex h-16 items-center border-b border-white/10 bg-[#0D1117]/96 px-6 backdrop-blur-sm">
        <h1 className="text-[18px] font-semibold text-white">AI Agentic Platform — Reference Architecture</h1>
      </header>

      <main className="pt-16">
        <div className="layout-shell h-[calc(100vh-64px)] min-h-[560px]">
          <div className={`architecture-pane ${isPanelOpen ? 'panel-open' : 'panel-closed'}`}>
            <div className="h-full min-h-0 overflow-hidden" onClick={handleMainArchitectureClick}>
              <div className="flex h-full min-h-0 flex-col-reverse">
                {layers.map((layer, layerIndex) => (
                  <LayerRow
                    key={layer.id}
                    layer={layer}
                    layerModules={modulesByLayer.get(layer.id) ?? []}
                    selectedModuleId={selectedModuleId}
                    onModuleSelect={handleModuleSelect}
                    registerCardRef={registerCardRef}
                    animationDelayMs={layerIndex * LAYER_STAGGER_MS}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className={`panel-shell ${isPanelOpen ? 'panel-open' : 'panel-closed'}`}>
            <DrillDownPanel
              module={displayedModule}
              layer={displayedLayer}
              isContentVisible={isPanelContentVisible}
              onClose={handleClosePanel}
              panelHeaderRef={panelHeaderRef}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
