# GrudgeVault — Guide d'installation et déploiement

> "Certains tournent la page. D'autres gardent les preuves."

## Prérequis

- Node.js 20+
- Un compte [Supabase](https://supabase.com) (gratuit)
- Un compte [Vercel](https://vercel.com) (gratuit pour déploiement)

---

## 1. Configuration Supabase

### 1.1 Créer un projet

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Choisir une région proche de vos utilisateurs
4. Noter l'URL et la clé Anon Key (Settings > API)

### 1.2 Exécuter le schéma SQL

1. Dans le dashboard Supabase, aller dans **SQL Editor**
2. Copier-coller le contenu de `supabase/schema.sql`
3. Cliquer **Run**

### 1.3 Configurer le Storage

Dans le dashboard Supabase, aller dans **Storage** :

1. Créer un bucket nommé `grudge-media`
2. **Désactiver** "Public bucket" (doit rester privé)
3. Ajouter les politiques suivantes dans **Storage > Policies** :

```sql
-- Upload : chaque utilisateur dans son propre dossier
CREATE POLICY "Users can upload own media"
ON storage.objects FOR INSERT
WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- Lecture : uniquement ses propres fichiers
CREATE POLICY "Users can view own media"
ON storage.objects FOR SELECT
USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Suppression : uniquement ses propres fichiers
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
USING (auth.uid()::text = (storage.foldername(name))[1]);
```

### 1.4 Configurer l'authentification

Dans **Authentication > Settings** :

1. Activer **Email confirmations**
2. Configurer l'URL de redirection : `https://votre-domaine.vercel.app/auth/callback`
3. Activer **Email** comme provider (activé par défaut)

---

## 2. Installation locale

```bash
# Cloner le repo
git clone <votre-repo>
cd grudgevault

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local

# Éditer .env.local avec vos vraies valeurs Supabase
```

Éditer `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
# Démarrer le serveur de développement
npm run dev
```

L'application est accessible sur `http://localhost:3000`

---

## 3. Déploiement sur Vercel

### 3.1 Via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### 3.2 Via GitHub (recommandé)

1. Pousser le code sur GitHub
2. Aller sur [vercel.com](https://vercel.com) > New Project
3. Importer le repository GitHub
4. Ajouter les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (votre URL Vercel)
5. Cliquer **Deploy**

### 3.3 Après déploiement

Mettre à jour dans Supabase **Authentication > URL Configuration** :
- Site URL : `https://votre-app.vercel.app`
- Redirect URLs : `https://votre-app.vercel.app/auth/callback`

---

## 4. Structure du projet

```
src/
├── app/
│   ├── auth/                 # Pages authentification
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── callback/         # OAuth callback route
│   ├── dashboard/            # App principale (protégée)
│   │   ├── grudges/          # Liste, création, détail, édition
│   │   ├── reminders/        # Gestion des rappels
│   │   ├── notifications/    # Centre de notifications
│   │   └── settings/         # Paramètres utilisateur
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/
│   ├── dashboard/            # Composants du dashboard
│   ├── grudge/               # Formulaire, médias, rappels
│   ├── landing/              # Landing page
│   ├── providers/            # Theme provider
│   └── ui/                   # shadcn/ui components
├── hooks/                    # React hooks réutilisables
│   ├── use-grudges.ts
│   ├── use-uploads.ts
│   ├── use-reminders.ts
│   ├── use-notifications.ts
│   ├── use-tags.ts
│   └── use-dashboard.ts
├── lib/
│   └── supabase/             # Clients Supabase (client, server, middleware)
├── middleware.ts             # Auth middleware Next.js
└── types/                    # Types TypeScript partagés
```

---

## 5. Architecture pour React Native (future)

Le backend Supabase et les hooks sont conçus pour être réutilisables :

- **Types** (`src/types/index.ts`) : partagés entre Next.js et React Native
- **Hooks** (`src/hooks/`) : logique métier isolée, adaptable pour React Native
- **Supabase client** : `@supabase/supabase-js` fonctionne identiquement en React Native
- **API** : toutes les opérations passent par Supabase directement (pas de backend custom)

Pour créer l'app mobile :
```bash
npx create-expo-app@latest grudgevault-mobile
cd grudgevault-mobile
npm install @supabase/supabase-js
# Copier src/types/ et adapter src/hooks/ pour React Native
```

---

## 6. Sécurité

- **Row Level Security** activé sur toutes les tables
- **Storage policies** : les fichiers sont strictement privés
- **Middleware** : toutes les routes `/dashboard/**` sont protégées
- **No public profiles** : aucune donnée n'est accessible publiquement
- **robots.txt** : `noindex, nofollow` sur toute l'app

---

## 7. Scripts disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run start    # Démarrer le build de production
npm run lint     # Vérification ESLint
```
