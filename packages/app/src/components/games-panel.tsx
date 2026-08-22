import { createSignal } from "solid-js"

export function GamesPanel() {
  const [open, setOpen] = createSignal(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        class="fixed bottom-4 right-4 z-50 rounded-lg bg-surface-info-base px-3 py-2 text-14-medium text-text-strong shadow-lg hover:opacity-90"
      >
        Games
      </button>

      {open() && (
        <div class="fixed top-0 right-0 z-40 h-full w-72 border-l border-surface-raised-base bg-v2-background-bg-base p-4 shadow-xl">
          <div class="flex items-center justify-between">
            <span class="text-16-semibold text-text-strong">Games</span>
            <button type="button" onClick={() => setOpen(false)} class="text-text-weak">
              ×
            </button>
          </div>
          <div class="mt-4 flex flex-col gap-2">
            <div class="rounded-lg bg-surface-raised-base p-3 text-14-regular text-text-base">Fake Game 1</div>
            <div class="rounded-lg bg-surface-raised-base p-3 text-14-regular text-text-base">Fake Game 2</div>
            <div class="rounded-lg bg-surface-raised-base p-3 text-14-regular text-text-base">Fake Game 3</div>
          </div>
        </div>
      )}
    </>
  )
}
