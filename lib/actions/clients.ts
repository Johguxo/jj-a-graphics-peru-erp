'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { clientSchema, contactSchema } from '@/lib/validations/client'

export type ActionResult = {
  success: boolean
  error?: string
}

export async function createClient(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData)
  const parsed = clientSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const data = parsed.data

  const existing = await prisma.client.findUnique({
    where: { documentNumber: data.documentNumber },
  })
  if (existing) {
    return { success: false, error: 'Ya existe un cliente con ese numero de documento' }
  }

  const client = await prisma.client.create({
    data: {
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      clientType: data.clientType,
      businessName: data.businessName,
      tradeName: data.tradeName || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      district: data.district || null,
      city: data.city || null,
      department: data.department || null,
      creditDays: data.creditDays,
      creditLimit: data.creditLimit ?? null,
      notes: data.notes || null,
    },
  })

  revalidatePath('/clientes')
  redirect(`/clientes/${client.id}`)
}

export async function updateClient(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData)
  const parsed = clientSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const data = parsed.data

  const existing = await prisma.client.findFirst({
    where: { documentNumber: data.documentNumber, NOT: { id } },
  })
  if (existing) {
    return { success: false, error: 'Ya existe otro cliente con ese numero de documento' }
  }

  await prisma.client.update({
    where: { id },
    data: {
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      clientType: data.clientType,
      businessName: data.businessName,
      tradeName: data.tradeName || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      district: data.district || null,
      city: data.city || null,
      department: data.department || null,
      creditDays: data.creditDays,
      creditLimit: data.creditLimit ?? null,
      notes: data.notes || null,
    },
  })

  revalidatePath('/clientes')
  revalidatePath(`/clientes/${id}`)
  redirect(`/clientes/${id}`)
}

export async function deleteClient(id: string): Promise<ActionResult> {
  await prisma.client.update({
    where: { id },
    data: { active: false },
  })

  revalidatePath('/clientes')
  redirect('/clientes')
}

export async function addContact(
  clientId: string,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData)
  const parsed = contactSchema.safeParse({
    ...raw,
    isPrimary: raw.isPrimary === 'true',
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  if (parsed.data.isPrimary) {
    await prisma.contact.updateMany({
      where: { clientId },
      data: { isPrimary: false },
    })
  }

  await prisma.contact.create({
    data: { clientId, ...parsed.data },
  })

  revalidatePath(`/clientes/${clientId}`)
  return { success: true }
}

export async function deleteContact(
  contactId: string,
  clientId: string
): Promise<ActionResult> {
  await prisma.contact.delete({ where: { id: contactId } })
  revalidatePath(`/clientes/${clientId}`)
  return { success: true }
}
