'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useCreateGrudge } from '@/hooks/use-grudges'
import { GrudgeForm } from '@/components/grudge/grudge-form'
import { PageHeader } from '@/components/dashboard/page-header'
import type { GrudgeFormData } from '@/types'

export default function NewGrudgePage() {
  const router = useRouter()
  const { create, loading } = useCreateGrudge()

  const handleSubmit = async (data: GrudgeFormData) => {
    const grudge = await create(data)
    if (grudge) router.push(`/dashboard/grudges/${grudge.id}`)
  }

  return (
    <div>
      <PageHeader
        title="Nouvelle Rancune"
        subtitle="Documentez avec précision. Les archives méritent la vérité."
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-6 max-w-2xl"
      >
        <GrudgeForm onSubmit={handleSubmit} loading={loading} />
      </motion.div>
    </div>
  )
}
