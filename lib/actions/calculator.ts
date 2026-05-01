'use server'

import { calculate } from '@/lib/calculator/engine'
import type { ServiceCalcInput, CalcResult } from '@/lib/calculator/types'

export async function calculateService(input: ServiceCalcInput): Promise<CalcResult> {
  return calculate(input)
}
