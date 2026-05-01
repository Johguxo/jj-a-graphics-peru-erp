'use client'

import { useActionState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { addPayment, type ActionResult } from '@/lib/actions/invoices'
import { PAYMENT_METHOD_LABELS } from '@/lib/constants'
import { toast } from 'sonner'

interface Props {
  invoiceId: string
  pendingAmount: number
}

export function PaymentForm({ invoiceId, pendingAmount }: Props) {
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(
    _prev: ActionResult | null,
    formData: FormData
  ): Promise<ActionResult> {
    return addPayment(invoiceId, formData)
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null)

  useEffect(() => {
    if (state?.success) {
      toast.success('Pago registrado')
      formRef.current?.reset()
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="amount"
          name="amount"
          label="Monto (S/)"
          type="number"
          step="0.01"
          min={0.01}
          max={pendingAmount}
          defaultValue={pendingAmount.toFixed(2)}
          required
        />
        <Select
          id="paymentMethod"
          name="paymentMethod"
          label="Metodo de Pago"
          defaultValue="TRANSFERENCIA"
          options={Object.entries(PAYMENT_METHOD_LABELS).map(
            ([value, label]) => ({ value, label })
          )}
        />
        <Input
          id="paymentDate"
          name="paymentDate"
          label="Fecha de Pago"
          type="date"
          defaultValue={today}
          required
        />
        <Input
          id="reference"
          name="reference"
          label="Referencia / N° Operacion"
          placeholder="Opcional"
        />
      </div>
      <Textarea
        id="notes"
        name="notes"
        label="Notas"
        placeholder="Opcional"
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || pendingAmount <= 0}>
          {isPending ? 'Registrando...' : 'Registrar Pago'}
        </Button>
      </div>
    </form>
  )
}
