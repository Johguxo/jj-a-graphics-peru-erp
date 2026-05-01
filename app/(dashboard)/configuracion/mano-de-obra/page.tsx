import { redirect } from 'next/navigation'

// Labor rates are now part of CostItems in the Materiales page
export default function ManoDeObraPage() {
  redirect('/configuracion/materiales')
}
