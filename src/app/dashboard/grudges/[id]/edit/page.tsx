'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGrudge, useUpdateGrudge } from '@/hooks/use-grudges'
import { GrudgeForm } from '@/components/grudge/grudge-form'
import { PageHeader } from '@/components/dashboard/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import type { GrudgeFormData } from '@/types'

export default function EditGrudgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { grudge, loading } = useGrudge(id)
  const { update, loading: saving } = useUpdateGrudge()

  const handleSubmit = async (data: GrudgeFormData) => {
    const ok = await update(id, data)
    if (ok) router.push(`/dashboard/grudges/${id}`)
  }

  if (loading) {
    return (
      <div>
        <div className="px-6 pt-8 pb-6 border-b border-border/50">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="px-6 py-6 space-y-4 max-w-2xl">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!grudge) return null

  return (
    <div>
      <PageHeader
        title="Modifier la rancune"
        subtitle={`${grudge.first_name} ${grudge.last_name || ''} — ${grudge.title}`}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-6 max-w-2xl"
      >
        <GrudgeForm
          defaultValues={grudge}
          onSubmit={handleSubmit}
          loading={saving}
          submitLabel="Mettre à jour"
        />
      </motion.div>
    </div>
  )
}
