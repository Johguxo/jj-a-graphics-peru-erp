'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { ClockIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { getVersionHistory } from './actions'

interface Version {
  id: string
  totalPrice: string | null
  quantityBase: number | null
  unitCost: string | null
  fixedCost: string | null
  reason: string | null
  createdAt: string
}

interface Props {
  costItemId: string
  itemName: string
}

export function VersionHistoryButton({ costItemId, itemName }: Props) {
  const [open, setOpen] = useState(false)
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setLoading(true)
      getVersionHistory(costItemId)
        .then(setVersions)
        .finally(() => setLoading(false))
    }
  }, [open, costItemId])

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        <ClockIcon className="h-3.5 w-3.5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card-bg p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Historial: {itemName}</h3>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-muted text-center py-4">Cargando...</p>
            ) : versions.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">Sin historial</p>
            ) : (
              <div className="space-y-3">
                {versions.map((v) => (
                  <div key={v.id} className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-muted">{formatDate(v.createdAt)}</span>
                    </div>
                    <div className="flex gap-4 text-xs font-mono">
                      {v.totalPrice && (
                        <span>Total: S/ {Number(v.totalPrice).toFixed(2)}</span>
                      )}
                      {v.quantityBase && (
                        <span>Base: {v.quantityBase}</span>
                      )}
                      {v.unitCost && (
                        <span>Unit: S/ {Number(v.unitCost).toFixed(6)}</span>
                      )}
                      {v.fixedCost && (
                        <span>Fijo: S/ {Number(v.fixedCost).toFixed(2)}</span>
                      )}
                    </div>
                    {v.reason && (
                      <p className="mt-1 text-xs text-muted italic">{v.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
