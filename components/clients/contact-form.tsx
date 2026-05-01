'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addContact, type ActionResult } from '@/lib/actions/clients'

interface ContactFormProps {
  clientId: string
}

export function ContactForm({ clientId }: ContactFormProps) {
  async function handleSubmit(
    _prev: ActionResult | null,
    formData: FormData
  ): Promise<ActionResult> {
    return addContact(clientId, formData)
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null)

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="text-sm text-danger">{state.error}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="contact-name"
          name="name"
          label="Nombre"
          required
        />
        <Input
          id="contact-position"
          name="position"
          label="Cargo"
        />
        <Input
          id="contact-email"
          name="email"
          label="Email"
          type="email"
        />
        <Input
          id="contact-phone"
          name="phone"
          label="Telefono"
        />
      </div>
      <input type="hidden" name="isPrimary" value="false" />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Agregando...' : 'Agregar Contacto'}
        </Button>
      </div>
    </form>
  )
}
