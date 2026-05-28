'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) {
      toast.error('Le mot de passe doit faire au moins 8 caractères.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Vérifiez votre email</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Un lien de confirmation a été envoyé à <strong>{form.email}</strong>.<br />
          Cliquez dessus pour activer votre coffre.
        </p>
        <p className="text-xs text-muted-foreground italic">"Les archives n'oublient jamais."</p>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-1">Créer votre coffre</h1>
        <p className="text-sm text-muted-foreground">Vos rancunes méritent mieux que la mémoire humaine.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Nom complet</Label>
          <Input
            id="full_name"
            placeholder="Votre nom"
            value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@example.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPass ? 'text' : 'password'}
              placeholder="8 caractères minimum"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              autoComplete="new-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full gradient-bg text-white border-0 grudge-glow" disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création...</> : 'Ouvrir mon coffre'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Déjà un compte ?{' '}
        <Link href="/auth/login" className="text-primary hover:underline font-medium">
          Se connecter
        </Link>
      </p>
    </motion.div>
  )
}
