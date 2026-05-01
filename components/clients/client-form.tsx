'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { createClient, updateClient, type ActionResult } from '@/lib/actions/clients'
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants'

interface ClientFormProps {
  client?: {
    id: string
    documentType: string
    documentNumber: string
    clientType: string
    businessName: string
    tradeName: string | null
    email: string | null
    phone: string | null
    address: string | null
    district: string | null
    city: string | null
    department: string | null
    creditDays: number
    creditLimit: string | null
    notes: string | null
  }
}

export function ClientForm({ client }: ClientFormProps) {
  const isEditing = !!client

  async function handleSubmit(
    _prev: ActionResult | null,
    formData: FormData
  ): Promise<ActionResult> {
    if (isEditing) {
      return updateClient(client.id, formData)
    }
    return createClient(formData)
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null)

  return (
    <form action={formAction}>
      <div className="space-y-6">
        {state?.error && (
          <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger dark:bg-red-950">
            {state.error}
          </div>
        )}

        <Card>
          <h3 className="mb-4 text-base font-semibold">Informacion del Documento</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              id="documentType"
              name="documentType"
              label="Tipo de Documento"
              defaultValue={client?.documentType || 'RUC'}
              options={Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            <Input
              id="documentNumber"
              name="documentNumber"
              label="Numero de Documento"
              defaultValue={client?.documentNumber || ''}
              placeholder="20XXXXXXXXX"
              required
            />
            <Select
              id="clientType"
              name="clientType"
              label="Tipo de Cliente"
              defaultValue={client?.clientType || 'PERSONA_JURIDICA'}
              options={[
                { value: 'PERSONA_JURIDICA', label: 'Persona Juridica' },
                { value: 'PERSONA_NATURAL', label: 'Persona Natural' },
              ]}
            />
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-base font-semibold">Datos Generales</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="businessName"
              name="businessName"
              label="Razon Social"
              defaultValue={client?.businessName || ''}
              required
            />
            <Input
              id="tradeName"
              name="tradeName"
              label="Nombre Comercial"
              defaultValue={client?.tradeName || ''}
            />
            <Input
              id="email"
              name="email"
              label="Email"
              type="email"
              defaultValue={client?.email || ''}
            />
            <Input
              id="phone"
              name="phone"
              label="Telefono"
              defaultValue={client?.phone || ''}
            />
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-base font-semibold">Direccion</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                id="address"
                name="address"
                label="Direccion"
                defaultValue={client?.address || ''}
              />
            </div>
            <Input
              id="district"
              name="district"
              label="Distrito"
              defaultValue={client?.district || ''}
            />
            <Input
              id="city"
              name="city"
              label="Ciudad"
              defaultValue={client?.city || ''}
            />
            <Input
              id="department"
              name="department"
              label="Departamento"
              defaultValue={client?.department || ''}
            />
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-base font-semibold">Condiciones Comerciales</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="creditDays"
              name="creditDays"
              label="Dias de Credito"
              type="number"
              defaultValue={client?.creditDays?.toString() || '0'}
              min={0}
            />
            <Input
              id="creditLimit"
              name="creditLimit"
              label="Limite de Credito (S/)"
              type="number"
              step="0.01"
              defaultValue={client?.creditLimit?.toString() || ''}
              placeholder="0.00"
            />
          </div>
          <div className="mt-4">
            <Textarea
              id="notes"
              name="notes"
              label="Notas"
              defaultValue={client?.notes || ''}
              placeholder="Notas adicionales sobre el cliente..."
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => history.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : isEditing ? 'Actualizar Cliente' : 'Crear Cliente'}
          </Button>
        </div>
      </div>
    </form>
  )
}
