interface ReminderEmailProps {
  userName: string
  traitorName: string
  grudgeTitle: string
  message: string
  incidentDate: string
  dashboardUrl: string
}

export function renderReminderEmail({
  userName,
  traitorName,
  grudgeTitle,
  message,
  incidentDate,
  dashboardUrl,
}: ReminderEmailProps): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Rappel GrudgeVault</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0d0d14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #161620; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 40px; }
    .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
    .logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #8b5cf6, #ec4899); border-radius: 12px; display: flex; align-items: center; justify-center: center; text-align: center; line-height: 40px; font-size: 20px; }
    .logo-text { font-size: 18px; font-weight: 700; background: linear-gradient(135deg, #c084fc, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .badge { display: inline-block; background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); color: #c084fc; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 24px; }
    h1 { color: #f1f0f7; font-size: 22px; font-weight: 700; margin: 0 0 8px; line-height: 1.3; }
    .subtitle { color: #6b6b8a; font-size: 14px; margin: 0 0 28px; }
    .divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 28px 0; }
    .info-block { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    .info-label { color: #6b6b8a; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
    .info-value { color: #e8e6f0; font-size: 15px; font-weight: 500; }
    .traitor-name { color: #f472b6; font-size: 20px; font-weight: 700; }
    .message-block { background: rgba(139,92,246,0.08); border-left: 3px solid #8b5cf6; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 20px 0; }
    .message-text { color: #c4b5fd; font-size: 14px; font-style: italic; line-height: 1.6; margin: 0; }
    .cta-button { display: block; width: fit-content; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: #fff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 14px; margin: 28px auto 0; text-align: center; }
    .footer { text-align: center; margin-top: 32px; }
    .footer p { color: #44445a; font-size: 12px; margin: 4px 0; }
    .footer a { color: #6b6b8a; text-decoration: none; }
    .severity-bar { height: 4px; background: linear-gradient(90deg, #22c55e, #f59e0b, #ef4444); border-radius: 2px; margin: 16px 0 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">
        <div class="logo-icon">🗡️</div>
        <span class="logo-text">GrudgeVault</span>
      </div>

      <div class="badge">📅 Rappel programmé</div>

      <h1>Les archives ont un message pour vous, ${escapeHtml(userName)}.</h1>
      <p class="subtitle">Vous aviez demandé à ne pas oublier ceci.</p>

      <hr class="divider" />

      <div class="info-block">
        <div class="info-label">Sujet de la rancune</div>
        <div class="info-value">${escapeHtml(grudgeTitle)}</div>
        <div class="severity-bar"></div>
      </div>

      <div class="info-block">
        <div class="info-label">La personne concernée</div>
        <div class="traitor-name">${escapeHtml(traitorName)}</div>
        <div class="info-label" style="margin-top:8px">Date de l'incident</div>
        <div class="info-value">${escapeHtml(incidentDate)}</div>
      </div>

      <div class="message-block">
        <p class="message-text">"${escapeHtml(message)}"</p>
      </div>

      <a href="${dashboardUrl}" class="cta-button">
        📁 Ouvrir les archives
      </a>

      <hr class="divider" />

      <p style="color:#44445a;font-size:12px;text-align:center;margin:0">
        Le pardon reste optionnel. Vos archives, elles, sont éternelles.
      </p>
    </div>

    <div class="footer">
      <p>GrudgeVault — Archives Émotionnelles Privées</p>
      <p>Vos données vous appartiennent. Toujours.</p>
      <p style="margin-top:8px">
        <a href="${dashboardUrl}/dashboard/settings">Se désabonner des rappels</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

export function renderWelcomeEmail({
  userName,
  dashboardUrl,
}: {
  userName: string
  dashboardUrl: string
}): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bienvenue sur GrudgeVault</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0d0d14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #161620; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 40px; }
    .logo-icon { font-size: 48px; text-align: center; display: block; margin-bottom: 16px; }
    h1 { color: #f1f0f7; font-size: 26px; font-weight: 700; text-align: center; margin: 0 0 8px; }
    .gradient-text { background: linear-gradient(135deg, #c084fc, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { color: #6b6b8a; font-size: 15px; text-align: center; margin: 0 0 32px; line-height: 1.6; }
    .feature { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
    .feature-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
    .feature-title { color: #e8e6f0; font-size: 14px; font-weight: 600; margin: 0 0 2px; }
    .feature-desc { color: #6b6b8a; font-size: 13px; margin: 0; }
    .divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 28px 0; }
    .quote { color: #c4b5fd; font-size: 16px; font-style: italic; text-align: center; margin: 0 0 28px; }
    .cta-button { display: block; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: #fff !important; text-decoration: none; padding: 16px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; text-align: center; }
    .footer { text-align: center; margin-top: 28px; color: #44445a; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <span class="logo-icon">🗡️</span>
      <h1>Bienvenue, <span class="gradient-text">${escapeHtml(userName)}</span>.</h1>
      <p class="subtitle">
        Votre coffre émotionnel est prêt.<br/>
        Les archives n'oublient jamais. Et maintenant, vous non plus.
      </p>

      <hr class="divider" />

      <div class="feature">
        <span class="feature-icon">📁</span>
        <div>
          <p class="feature-title">Archivez vos rancunes</p>
          <p class="feature-desc">Nom, catégorie, niveau de gravité 1–10, description complète.</p>
        </div>
      </div>
      <div class="feature">
        <span class="feature-icon">📸</span>
        <div>
          <p class="feature-title">Uploadez vos preuves</p>
          <p class="feature-desc">Screenshots, audios, PDFs. Privés et sécurisés.</p>
        </div>
      </div>
      <div class="feature">
        <span class="feature-icon">🔔</span>
        <div>
          <p class="feature-title">Programmez des rappels</p>
          <p class="feature-desc">Quotidiens, hebdomadaires, annuels. Pour ne jamais oublier.</p>
        </div>
      </div>

      <hr class="divider" />

      <p class="quote">"Certains tournent la page. D'autres gardent les preuves."</p>

      <a href="${dashboardUrl}/dashboard" class="cta-button">
        🗡️ Ouvrir mes archives
      </a>
    </div>

    <div class="footer">
      <p>GrudgeVault — 100% privé, 0 profil public</p>
      <p style="margin-top:4px">Vos données vous appartiennent. Toujours.</p>
    </div>
  </div>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
