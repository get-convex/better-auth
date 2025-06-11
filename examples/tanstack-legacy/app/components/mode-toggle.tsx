'use client'

import { Loader2 } from 'lucide-react'

export function ModeToggle({
  isServer,
  onSwitch,
  isPending,
}: {
  isServer: boolean
  onSwitch?: (isServer: boolean) => void
  isPending?: boolean
}) {
  return (
    <div className="w-full flex justify-center mb-6">
      <div
        className="inline-flex rounded-full p-1 shadow max-w-2xl bg-neutral-800/80"
        role="tablist"
        aria-label="Dashboard mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected={!isServer}
          onClick={() => onSwitch?.(false)}
          disabled={!isServer || isPending}
          className={`px-6 py-2 rounded-full font-semibold transition-all outline-none
            ${
              !isServer
                ? 'bg-white text-black shadow font-bold'
                : 'bg-transparent text-neutral-400 hover:bg-neutral-700 hover:text-white cursor-pointer'
            }
            ${isPending && !isServer ? 'opacity-60' : ''}
          `}
        >
          {!isServer && isPending ? (
            <Loader2 className="animate-spin inline w-4 h-4" />
          ) : (
            'Client Only'
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isServer}
          onClick={() => onSwitch?.(true)}
          disabled={isServer || isPending}
          className={`px-6 py-2 rounded-full font-semibold transition-all outline-none
            ${
              isServer
                ? 'bg-white text-black shadow font-bold'
                : 'bg-transparent text-neutral-400 hover:bg-neutral-700 hover:text-white cursor-pointer'
            }
            ${isPending && isServer ? 'opacity-60' : ''}
          `}
        >
          {isServer && isPending ? (
            <Loader2 className="animate-spin inline w-4 h-4" />
          ) : (
            'Server'
          )}
        </button>
      </div>
    </div>
  )
}
