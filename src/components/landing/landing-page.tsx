'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronDown, Shield, Lock, Archive, Bell, Search, Upload,
  Star, Zap, Heart, ChevronRight
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
}

const features = [
  { icon: Archive, title: 'Archives Complètes', desc: 'Prénom, surnom, catégorie, niveau de gravité 1–10. Chaque trahison documentée avec la précision qu\'elle mérite.', color: 'text-purple-400' },
  { icon: Upload, title: 'Preuves Numériques', desc: 'Screenshots, enregistrements vocaux, PDFs. Parce que "il a dit / elle a dit" ne suffit pas toujours.', color: 'text-red-400' },
  { icon: Bell, title: 'Rappels Humoristiques', desc: '"Rappelle-toi ce que Kevin a fait le 4 mars." Des notifications quotidiennes, hebdomadaires ou annuelles.', color: 'text-amber-400' },
  { icon: Search, title: 'Recherche Avancée', desc: 'Filtrez par nom, catégorie, gravité, tags. Retrouvez n\'importe quelle trahison en 3 secondes.', color: 'text-cyan-400' },
  { icon: Shield, title: 'Strictement Privé', desc: 'Row Level Security Supabase. Zéro profil public. Zéro réseau social. Vos données n\'appartiennent qu\'à vous.', color: 'text-green-400' },
  { icon: Lock, title: 'Chiffrement & Sécurité', desc: 'URLs signées pour vos fichiers, sessions sécurisées, aucune indexation publique. Fort comme votre rancune.', color: 'text-blue-400' },
]

const testimonials = [
  { name: 'Amélie R.', role: 'Ancienne meilleure amie', text: 'Enfin une app qui comprend que certains souvenirs méritent mieux qu\'une note dans le téléphone. 10/10, Kevin sait pourquoi.', stars: 5 },
  { name: 'Thomas D.', role: 'Ex-associé', text: 'J\'ai archivé 47 trahisons professionnelles en deux semaines. Mon thérapeute est impressionné par mon organisation.', stars: 5 },
  { name: 'Nadia K.', role: 'Survivante de réunions de famille', text: 'La catégorie "manipulation" était exactement ce qu\'il me fallait. L\'interface est magnifique. La tante Martine aussi est archivée.', stars: 5 },
  { name: 'Marc L.', role: 'Ancien collègue de bureau', text: 'Le mode "Top Traîtres" m\'a révélé des patterns que je n\'avais pas remarqués. C\'est thérapeutique, je vous jure.', stars: 5 },
]

const faqs = [
  { q: 'Est-ce que GrudgeVault encourage la vengeance ?', a: 'Absolument pas. GrudgeVault est un espace privé de documentation émotionnelle. Comme un journal intime, mais mieux organisé et avec des uploads.' },
  { q: 'Mes données sont-elles vraiment privées ?', a: 'Totalement. Row Level Security Supabase garantit que personne — pas même les administrateurs — ne peut voir vos données. Aucun profil public, aucun partage, aucune indexation.' },
  { q: 'Puis-je exporter mes données ?', a: 'Oui. Dans les paramètres, vous pouvez exporter toutes vos rancunes en JSON ou CSV à tout moment. Vos données vous appartiennent.' },
  { q: 'Les rappels sont-ils vraiment humoristiques ?', a: 'Les messages sont écrits avec humour et légèreté. Rien de menaçant, jamais. Juste un petit rappel que le karma fait son travail sans votre aide.' },
  { q: 'Y aura-t-il une application mobile ?', a: 'En cours de développement. L\'architecture est déjà préparée pour React Native / Expo. Les archives de vos rancunes seront bientôt dans votre poche.' },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.72_0.19_310/15%)_0%,transparent_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,oklch(0.62_0.24_25/10%)_0%,transparent_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg,oklch(1 0 0),oklch(1 0 0) 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,oklch(1 0 0),oklch(1 0 0) 1px,transparent 1px,transparent 60px)',
          }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-bg border border-primary/30 flex items-center justify-center">
            <span className="text-base">🗡️</span>
          </div>
          <span className="text-lg font-bold gradient-text">GrudgeVault</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Connexion
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm" className="gradient-bg text-white border-0 grudge-glow">
              Commencer
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-16 pb-24 max-w-4xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1">
            🔒 100% Privé · Zero Profil Public
          </Badge>
        </motion.div>

        <motion.h1
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6"
        >
          Certains tournent{' '}
          <span className="gradient-text">la page.</span>
          <br />
          D'autres gardent{' '}
          <span className="gradient-text">les preuves.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          GrudgeVault est votre journal privé de rancunes. Archivez trahisons, captures d'écran,
          enregistrements et rappels. Organisé. Sécurisé. Légèrement dramatique.
        </motion.p>

        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/auth/register">
            <Button size="lg" className="gradient-bg text-white border-0 grudge-glow px-8 text-base">
              Ouvrir mon coffre gratuitement
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="border-border text-muted-foreground hover:text-foreground px-8 text-base">
              Voir les fonctionnalités
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={4}
          className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto"
        >
          {[
            { value: '10+', label: 'Catégories' },
            { value: '∞', label: 'Rancunes' },
            { value: '0', label: 'Profils publics' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Tes dégâts émotionnels méritent{' '}
            <span className="gradient-text">un stockage organisé.</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Tout ce dont vous avez besoin pour ne plus jamais oublier une trahison.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="grudge-glass rounded-2xl p-6 group"
            >
              <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center mb-4 ${feat.color}`}>
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold mb-2">{feat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Simple comme <span className="gradient-text">une trahison.</span>
          </motion.h2>
        </div>
        <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Créez votre coffre', desc: 'Inscription gratuite, email vérifié, coffre sécurisé prêt en 30 secondes.', emoji: '🗝️' },
            { step: '02', title: 'Archivez vos rancunes', desc: 'Ajoutez la personne, la catégorie, le niveau de gravité et vos preuves.', emoji: '📁' },
            { step: '03', title: 'Ne jamais oublier', desc: 'Programmez des rappels. Les archives n\'oublient jamais. Le pardon reste optionnel.', emoji: '⏰' },
          ].map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl gradient-bg border border-primary/30 flex items-center justify-center mx-auto mb-4 grudge-glow text-2xl">
                {step.emoji}
              </div>
              <div className="text-xs text-primary font-mono mb-2">{step.step}</div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ils nous font <span className="gradient-text">confiance.</span>
          </h2>
          <p className="text-muted-foreground text-sm">(Les noms ont été changés pour protéger les coupables.)</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="grudge-glass rounded-2xl p-6"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">"{t.text}"</p>
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 px-6 py-24 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Questions <span className="gradient-text">fréquentes.</span></h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="grudge-glass rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:text-primary transition-colors"
              >
                {faq.q}
                <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 ml-4 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3"
                >
                  {faq.a}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center grudge-glass rounded-3xl p-12 grudge-glow"
        >
          <div className="text-4xl mb-4">🗡️</div>
          <h2 className="text-3xl font-bold mb-4">
            N'oublie plus jamais <span className="gradient-text">une trahison.</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Rejoignez des milliers d'archivistes émotionnels. Gratuit. Privé. Légèrement cathartique.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="gradient-bg text-white border-0 grudge-glow px-10 text-base">
              <Zap className="mr-2 h-4 w-4" />
              Créer mon coffre gratuitement
            </Button>
          </Link>
          <p className="mt-4 text-xs text-muted-foreground italic">
            Aucune carte bancaire. Aucun profil public. Aucun jugement.
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">🗡️</span>
            <span className="text-sm font-semibold gradient-text">GrudgeVault</span>
            <span className="text-xs text-muted-foreground ml-2">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" /> Fait avec rancœur constructive</span>
            <span>100% Privé</span>
            <span>Zéro Harcèlement</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
