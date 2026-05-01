'use client'

import { useState, useCallback, useEffect } from 'react'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CostBreakdown } from './cost-breakdown'
import { EstampadoForm } from './estampado-form'
import { BlocksForm } from './blocks-form'
import { AnilladoForm } from './anillado-form'
import { calculateService } from '@/lib/actions/calculator'
import { SERVICE_TYPE_LABELS } from '@/lib/constants'
import type {
  ServiceCalcInput,
  CalcResult,
  EstampadoInput,
  BlocksInput,
  AnilladoInput,
} from '@/lib/calculator/types'
import { PlusIcon } from '@heroicons/react/24/outline'

const defaultEstampado: EstampadoInput = {
  quantity: 1,
  bookSize: 'A4',
  includesLogo: false,
  phraseCount: 0,
  detailCount: 0,
}

const defaultBlocks: BlocksInput = {
  paperSize: 'A4',
  isColor: false,
  quantity: 1000,
  doubleSided: false,
  numbered: false,
}

const defaultAnillado: AnilladoInput = {
  quantity: 1,
  pageCount: 50,
  size: 'A4',
  ringSize: 'PEQUENO',
  collated: false,
}

interface QuoteItemDraft {
  serviceType: 'ESTAMPADO' | 'BLOCKS' | 'ANILLADO'
  description: string
  calcInput: Record<string, unknown>
  calcDetail: Record<string, unknown>
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Props {
  onAddItem: (item: QuoteItemDraft) => void
}

export function CalculatorShell({ onAddItem }: Props) {
  const [serviceType, setServiceType] = useState<'ESTAMPADO' | 'BLOCKS' | 'ANILLADO'>('BLOCKS')
  const [estampadoData, setEstampadoData] = useState(defaultEstampado)
  const [blocksData, setBlocksData] = useState(defaultBlocks)
  const [anilladoData, setAnilladoData] = useState(defaultAnillado)
  const [result, setResult] = useState<CalcResult | null>(null)
  const [loading, setLoading] = useState(false)

  const doCalculate = useCallback(async () => {
    let input: ServiceCalcInput
    switch (serviceType) {
      case 'ESTAMPADO':
        if (estampadoData.quantity < 1) return
        input = { type: 'ESTAMPADO', data: estampadoData }
        break
      case 'BLOCKS':
        if (blocksData.quantity < 1) return
        input = { type: 'BLOCKS', data: blocksData }
        break
      case 'ANILLADO':
        if (anilladoData.quantity < 1) return
        input = { type: 'ANILLADO', data: anilladoData }
        break
    }

    setLoading(true)
    try {
      const res = await calculateService(input)
      setResult(res)
    } catch (err) {
      console.error('Calculation error:', err)
    } finally {
      setLoading(false)
    }
  }, [serviceType, estampadoData, blocksData, anilladoData])

  // Auto-calculate on changes with debounce
  useEffect(() => {
    const timer = setTimeout(doCalculate, 300)
    return () => clearTimeout(timer)
  }, [doCalculate])

  function handleAddItem() {
    if (!result) return

    let inputData: Record<string, unknown>
    let qty: number
    let description: string

    switch (serviceType) {
      case 'ESTAMPADO':
        inputData = { ...estampadoData }
        qty = estampadoData.quantity
        description = `Estampado ${estampadoData.bookSize} x ${qty}`
        break
      case 'BLOCKS':
        inputData = { ...blocksData }
        qty = blocksData.quantity
        description = `Blocks ${blocksData.paperSize} x ${qty}${blocksData.doubleSided ? ' (T/R)' : ''}${blocksData.numbered ? ' Num.' : ''}`
        break
      case 'ANILLADO':
        inputData = { ...anilladoData }
        qty = anilladoData.quantity
        description = `Anillado ${anilladoData.size} ${anilladoData.pageCount}pag x ${qty}`
        break
    }

    onAddItem({
      serviceType,
      description,
      calcInput: inputData,
      calcDetail: { lines: result.lines, subtotal: result.subtotal, margin: result.margin },
      quantity: qty,
      unitPrice: Math.round((result.total / qty) * 100) / 100,
      totalPrice: result.total,
    })

    setResult(null)
  }

  return (
    <Card>
      <h3 className="mb-4 text-base font-semibold">Calculadora de Costos</h3>

      <div className="mb-4">
        <Select
          id="serviceType"
          label="Tipo de Servicio"
          value={serviceType}
          onChange={(e) => {
            setServiceType(e.target.value as 'ESTAMPADO' | 'BLOCKS' | 'ANILLADO')
            setResult(null)
          }}
          options={Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
        />
      </div>

      <div className="mb-6">
        {serviceType === 'ESTAMPADO' && (
          <EstampadoForm value={estampadoData} onChange={setEstampadoData} />
        )}
        {serviceType === 'BLOCKS' && (
          <BlocksForm value={blocksData} onChange={setBlocksData} />
        )}
        {serviceType === 'ANILLADO' && (
          <AnilladoForm value={anilladoData} onChange={setAnilladoData} />
        )}
      </div>

      <CostBreakdown result={result} loading={loading} />

      {result && result.total > 0 && (
        <div className="mt-4 flex justify-end">
          <Button onClick={handleAddItem}>
            <PlusIcon className="h-4 w-4" />
            Agregar a Cotizacion
          </Button>
        </div>
      )}
    </Card>
  )
}
