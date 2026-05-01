'use client'

import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { RING_SIZE_OPTIONS } from '@/lib/constants'
import type { AnilladoInput } from '@/lib/calculator/types'

interface Props {
  value: AnilladoInput
  onChange: (value: AnilladoInput) => void
}

export function AnilladoForm({ value, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input
        id="ani-quantity"
        label="Cantidad de documentos"
        type="number"
        min={1}
        value={value.quantity}
        onChange={(e) => onChange({ ...value, quantity: Number(e.target.value) || 0 })}
      />
      <Input
        id="ani-pages"
        label="Paginas por documento"
        type="number"
        min={1}
        value={value.pageCount}
        onChange={(e) => onChange({ ...value, pageCount: Number(e.target.value) || 0 })}
      />
      <Select
        id="ani-size"
        label="Tamano"
        value={value.size}
        onChange={(e) => onChange({ ...value, size: e.target.value as AnilladoInput['size'] })}
        options={[
          { value: 'A4', label: 'A4' },
          { value: 'A3', label: 'A3' },
        ]}
      />
      <Select
        id="ani-ringSize"
        label="Tamano del anillo"
        value={value.ringSize}
        onChange={(e) => onChange({ ...value, ringSize: e.target.value as AnilladoInput['ringSize'] })}
        options={RING_SIZE_OPTIONS}
      />
      <div className="sm:col-span-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={value.collated}
            onChange={(e) => onChange({ ...value, collated: e.target.checked })}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          Compaginado
        </label>
      </div>
    </div>
  )
}
