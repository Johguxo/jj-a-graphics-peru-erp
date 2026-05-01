import Decimal from 'decimal.js'

// ─── Calculator Result ─────────────────────────────────

export interface CalcBreakdownLine {
  concept: string
  type: 'variable' | 'fixed'
  quantity?: number
  unitCost: number
  amount: number
}

export interface CalcResult {
  lines: CalcBreakdownLine[]
  subtotal: number
  margin: number
  marginAmount: number
  total: number
}

// ─── Service Input Types ───────────────────────────────

export interface EstampadoInput {
  quantity: number        // number of books
  bookSize: 'A4' | 'A5' | 'A3'
  includesLogo: boolean
  phraseCount: number     // number of phrases/words
  detailCount: number     // number of finishing details (lines, decorations)
}

export interface BlocksInput {
  paperSize: 'A4' | 'A5' | 'MEDIA_CARTA'
  isColor: boolean        // false = black & white
  quantity: number         // total sheets/copies
  doubleSided: boolean     // tira y retira
  numbered: boolean
}

export interface AnilladoInput {
  quantity: number         // number of bound documents
  pageCount: number        // pages per document
  size: 'A4' | 'A3'
  ringSize: 'PEQUENO' | 'MEDIANO' | 'GRANDE'
  collated: boolean        // compaginado
}

export type ServiceCalcInput =
  | { type: 'ESTAMPADO'; data: EstampadoInput }
  | { type: 'BLOCKS'; data: BlocksInput }
  | { type: 'ANILLADO'; data: AnilladoInput }

// ─── Cost Item from DB ─────────────────────────────────

export interface CostItemData {
  key: string
  name: string
  costType: string
  totalPrice: number | null
  quantityBase: number | null
  unitCost: number | null
  fixedCost: number | null
}

export type CostItemMap = Map<string, CostItemData>
