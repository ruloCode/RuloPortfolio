// Welcome email sent right after a successful waitlist signup.
//
// Standalone by design: no `@/` aliases and no next/* imports —
// scripts/backfill-welcome-emails.ts imports this module directly via tsx.

type WelcomeEmail = {
  subject: string;
  html: string;
  text: string;
};

type Lesson = { n: string; title: string; body: string };

type WelcomeCopy = {
  subject: string;
  preheader: string;
  wordmarkSuffix: string;
  chip: string;
  heading: string;
  /** Used when we know their name. {name} is the first word they gave. */
  headingNamed: string;
  intro: string;
  pull: string;
  ctaLabel: string;
  ctaNote: string;
  lessonsTitle: string;
  lessons: readonly [Lesson, Lesson, Lesson];
  cohortTitle: string;
  cohortBody: string;
  signOff: string;
  signature: string;
  signatureRole: string;
  footerCadence: string;
  unsubscribeLabel: string;
};

// Email clients can't read CSS variables, so the brand tokens are frozen here.
// Mirrors src/once-ui/tokens/scheme.scss (slate + emerald + cyan, dark theme).
const C = {
  page: "#040816",
  card: "#0F152B",
  border: "#393F55",
  text: "#ffffff",
  textSecondary: "#DAE0F6",
  muted: "#8E94AA",
  emerald: "#08A97C",
  cyan: "#049EE2",
  // Emerald reserved for text on dark: #08A97C on #0F152B misses AA at small sizes.
  emeraldLight: "#84F6C3",
} as const;

const FONT =
  "'Space Grotesk','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://rulocode.com").replace(/\/+$/, "");
export const CONTACT_EMAIL = "hola@rulocode.com";

export type WelcomeLocale = "es" | "en";

// Defaults to Spanish on purpose (LatAm audience), even though
// routing.defaultLocale is "en". Existing rows depend on this.
export const resolveWelcomeLocale = (locale?: string): WelcomeLocale =>
  locale === "en" ? "en" : "es";

// Mirrors the i18n routing (localePrefix "as-needed", defaultLocale "en").
const dashboardUrl = (locale: WelcomeLocale, email?: string) => {
  const base = `${SITE_URL}${locale === "es" ? "/es" : ""}/dashboard`;
  return email ? `${base}?email=${encodeURIComponent(email)}` : base;
};

const unsubscribeUrl = (locale: WelcomeLocale) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    locale === "es" ? "Salir de la lista" : "Unsubscribe",
  )}`;

const COPY: Record<WelcomeLocale, WelcomeCopy> = {
  es: {
    subject: "Estás dentro — tu Semana 0 ya está abierta",
    preheader: "Tres lecciones te esperan en el dashboard. La primera te toma 20 minutos.",
    wordmarkSuffix: "AI SHIFT CHALLENGE",
    chip: "CUPO CONFIRMADO",
    heading: "Estás dentro.",
    headingNamed: "Estás dentro, {name}.",
    intro:
      "Tu cupo en la primera cohorte del AI Shift Challenge quedó reservado. Eso ya está — no tienes que hacer nada más para asegurarlo.",
    pull: "Pero no te escribí para que esperes. Mientras la cohorte abre, tu Semana 0 ya está abierta en el dashboard: tres lecciones para que arranques hoy, no en cuatro semanas.",
    ctaLabel: "Entrar a mi Semana 0",
    ctaNote: "Pides tu enlace de acceso ahí mismo — sin contraseña.",
    lessonsTitle: "Lo que te espera en Semana 0",
    lessons: [
      {
        n: "01",
        title: "Diagnóstico",
        body: "Las 3 tareas que se están comiendo tu semana. Las encuentras en 20 minutos y las tienes por escrito.",
      },
      {
        n: "02",
        title: "Tu copiloto diario",
        body: "El prompt que vas a reusar todos los días — construido sobre tu trabajo, no sobre un ejemplo genérico.",
      },
      {
        n: "03",
        title: "Tu primera automatización",
        body: "Un flujo corriendo hoy. Pequeño, real, tuyo. Sin escribir código.",
      },
    ],
    cohortTitle: "Y cuando abra la cohorte",
    cohortBody:
      "Entras primero y con precio de lanzamiento — la lista fundadora tiene prioridad sobre todo lo demás. Te aviso con fecha y cupo antes que a nadie.",
    signOff: "Nos leemos pronto,",
    signature: "Rulo",
    signatureRole: "Andrés Santana · Experto en IA aplicada",
    footerCadence:
      "Te escribo cuando hay algo que puedas usar. Nada de relleno — y te sales cuando quieras.",
    unsubscribeLabel: "Salir de la lista",
  },
  en: {
    subject: "You're in — your Week 0 is open",
    preheader: "Three lessons waiting in your dashboard. The first one takes 20 minutes.",
    wordmarkSuffix: "AI SHIFT CHALLENGE",
    chip: "SPOT CONFIRMED",
    heading: "You're in.",
    headingNamed: "You're in, {name}.",
    intro:
      "Your spot in the first AI Shift Challenge cohort is reserved. That's done — nothing else to do to keep it.",
    pull: "But I didn't write so you'd wait. While the cohort opens, your Week 0 is already open in the dashboard: three lessons so you start today, not in four weeks.",
    ctaLabel: "Open my Week 0",
    ctaNote: "You request your access link right there — no password.",
    lessonsTitle: "What's waiting in Week 0",
    lessons: [
      {
        n: "01",
        title: "Diagnosis",
        body: "The 3 tasks eating your week. You find them in 20 minutes and you have them in writing.",
      },
      {
        n: "02",
        title: "Your daily copilot",
        body: "The prompt you'll reuse every day — built on your work, not on a generic example.",
      },
      {
        n: "03",
        title: "Your first automation",
        body: "A flow running today. Small, real, yours. No code.",
      },
    ],
    cohortTitle: "And when the cohort opens",
    cohortBody:
      "You get in first, at launch pricing — the founding list has priority over everything else. You'll get the date and your spot before anyone else.",
    signOff: "Talk soon,",
    signature: "Rulo",
    signatureRole: "Andrés Santana · Applied AI expert",
    footerCadence:
      "I write when there's something you can use. No filler — and you can leave whenever you want.",
    unsubscribeLabel: "Unsubscribe",
  },
} as const;

// Hidden line the inbox shows next to the subject; the padding pushes the
// footer text out of the preview.
const renderPreheader = (text: string) =>
  `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${text}${"&#8199;&#65279;&#847;".repeat(60)}</div>`;

// Outlook's Word renderer ignores CSS gradients, so it gets VML. Everything else
// gets the anchor, which also carries a solid emerald background-color as the
// fallback — a degraded button is still on-brand, never transparent.
const renderButton = (href: string, label: string) => `
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:52px;v-text-anchor:middle;width:280px;" arcsize="25%" stroke="f" fillcolor="${C.emerald}">
  <v:fill type="gradient" color="${C.emerald}" color2="${C.cyan}" angle="270" />
  <w:anchorlock/>
  <center style="color:#ffffff;font-family:'Segoe UI',Arial,sans-serif;font-size:16px;font-weight:bold;">${label}</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-->
<a href="${href}" class="sm-btn" style="display:inline-block;background-color:${C.emerald};background-image:linear-gradient(100deg,${C.emerald},${C.cyan});border-radius:12px;color:#ffffff;font-family:${FONT};font-size:16px;font-weight:700;line-height:52px;height:52px;text-align:center;text-decoration:none;padding:0 32px;mso-hide:all;">${label}</a>
<!--<![endif]-->`;

const renderLesson = ({ n, title, body }: Lesson) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr>
    <td width="36" valign="top" style="width:36px;padding:0 12px 0 0;font-family:${FONT};font-size:15px;font-weight:700;line-height:1.45;color:${C.emeraldLight};" class="t-emerald">${n}</td>
    <td valign="top">
      <div class="t-primary" style="font-family:${FONT};font-size:15px;font-weight:700;line-height:1.4;color:${C.text};padding-bottom:4px;">${title}</div>
      <div class="t-muted" style="font-family:${FONT};font-size:14px;line-height:1.6;color:${C.muted};">${body}</div>
    </td>
  </tr>
</table>`;

const renderDivider = () => `
<tr><td style="padding:28px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td bgcolor="${C.border}" style="height:1px;line-height:1px;font-size:0;background-color:${C.border};">&nbsp;</td>
  </tr></table>
</td></tr>`;

// Escapes free text before it lands in the HTML — the name comes from a form
// and reaches an inbox, so it can never be interpolated raw.
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// First word only: "Hola, Rulo." reads better than the full legal name.
const firstNameOf = (fullName?: string | null) => (fullName ?? "").trim().split(/\s+/)[0] ?? "";

const headingFor = (copy: WelcomeCopy, fullName?: string | null) => {
  const first = firstNameOf(fullName);
  return first ? copy.headingNamed.replace("{name}", first) : copy.heading;
};

// The plain-text alternative measurably helps inbox placement.
const renderText = (copy: WelcomeCopy, urls: { dashboard: string; unsubscribe: string }, heading: string) =>
  [
    heading,
    copy.intro,
    copy.pull,
    `${copy.ctaLabel}:\n${urls.dashboard}`,
    copy.ctaNote,
    "---",
    copy.lessonsTitle.toUpperCase(),
    ...copy.lessons.map((l) => `${l.n} · ${l.title}\n${l.body}`),
    "---",
    copy.cohortTitle.toUpperCase(),
    copy.cohortBody,
    `${copy.signOff}\n${copy.signature}\n${copy.signatureRole}`,
    "--",
    `${copy.footerCadence}\n${copy.unsubscribeLabel}: ${urls.unsubscribe}\nrulocode.com`,
  ].join("\n\n");

export const buildWelcomeEmail = (
  locale: WelcomeLocale,
  options?: { email?: string; fullName?: string | null },
): WelcomeEmail => {
  const copy = COPY[locale];
  const heading = headingFor(copy, options?.fullName);
  const urls = {
    // A plain link, not an embedded magic link: those expire in an hour (most
    // people open this later) and link prescanners burn the single-use token
    // before the human clicks. Two clicks that always work beat one that fails.
    dashboard: dashboardUrl(locale, options?.email),
    unsubscribe: unsubscribeUrl(locale),
  };

  return {
    subject: copy.subject,
    text: renderText(copy, urls, heading),
    html: `<!doctype html>
<html lang="${locale}" dir="ltr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>${copy.subject}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  :root{color-scheme:dark light;supported-color-schemes:dark light;}
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
  a{text-decoration:none;}
  @media only screen and (max-width:620px){
    .sm-p{padding:24px!important;}
    .sm-h1{font-size:28px!important;line-height:1.15!important;}
    .sm-btn{display:block!important;width:100%!important;padding:0!important;}
  }
  /* Outlook.com forces its own dark-mode inversion; re-assert every colour. */
  [data-ogsc] .t-primary{color:${C.text}!important;}
  [data-ogsc] .t-secondary{color:${C.textSecondary}!important;}
  [data-ogsc] .t-muted{color:${C.muted}!important;}
  [data-ogsc] .t-emerald{color:${C.emeraldLight}!important;}
  [data-ogsb] .bg-page{background-color:${C.page}!important;}
  [data-ogsb] .bg-card{background-color:${C.card}!important;}
</style>
</head>
<body class="bg-page" style="margin:0;padding:0;width:100%;background-color:${C.page};">
${renderPreheader(copy.preheader)}
<div role="article" aria-roledescription="email" aria-label="${copy.subject}" lang="${locale}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.page}" class="bg-page" style="background-color:${C.page};">
<tr><td align="center" style="padding:32px 20px;">
<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

  <!-- Text wordmark, never an image: Gmail strips SVG and blocked images leave
       a broken box. Zero images also keeps this out of the spam heuristics. -->
  <tr><td align="left" style="padding:0 0 18px 2px;font-family:${FONT};font-size:13px;font-weight:700;letter-spacing:0.16em;color:${C.text};" class="t-primary">RULO<span style="color:${C.emerald};">&nbsp;·&nbsp;</span><span style="color:${C.muted};font-weight:400;" class="t-muted">${copy.wordmarkSuffix}</span></td></tr>

  <tr><td bgcolor="${C.emerald}" style="height:3px;line-height:3px;font-size:0;background-color:${C.emerald};background-image:linear-gradient(100deg,${C.emerald},${C.cyan});border-radius:16px 16px 0 0;">&nbsp;</td></tr>

  <tr><td bgcolor="${C.card}" class="bg-card sm-p" style="background-color:${C.card};border:1px solid ${C.border};border-top:none;border-radius:0 0 16px 16px;padding:40px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

      <tr><td style="padding-bottom:20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td bgcolor="${C.page}" style="background-color:${C.page};border:1px solid ${C.emerald};border-radius:999px;padding:6px 12px;font-family:${FONT};font-size:11px;font-weight:500;letter-spacing:0.08em;color:${C.emeraldLight};" class="t-emerald">${copy.chip}</td>
        </tr></table>
      </td></tr>

      <tr><td class="t-primary sm-h1" style="font-family:${FONT};font-size:32px;font-weight:700;line-height:1.1;letter-spacing:-0.02em;color:${C.text};padding-bottom:16px;">${escapeHtml(heading)}</td></tr>
      <tr><td class="t-secondary" style="font-family:${FONT};font-size:15px;line-height:1.65;color:${C.textSecondary};padding-bottom:14px;">${copy.intro}</td></tr>
      <tr><td class="t-secondary" style="font-family:${FONT};font-size:15px;line-height:1.65;color:${C.textSecondary};padding-bottom:28px;">${copy.pull}</td></tr>

      <tr><td align="left" style="padding-bottom:10px;">${renderButton(urls.dashboard, copy.ctaLabel)}</td></tr>
      <tr><td class="t-muted" style="font-family:${FONT};font-size:13px;line-height:1.5;color:${C.muted};">${copy.ctaNote}</td></tr>

      ${renderDivider()}

      <tr><td class="t-primary" style="font-family:${FONT};font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${C.text};padding-bottom:18px;">${copy.lessonsTitle}</td></tr>
      <tr><td>${copy.lessons.map(renderLesson).join("")}</td></tr>

      ${renderDivider()}

      <tr><td class="t-primary" style="font-family:${FONT};font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${C.text};padding-bottom:12px;">${copy.cohortTitle}</td></tr>
      <tr><td class="t-secondary" style="font-family:${FONT};font-size:15px;line-height:1.65;color:${C.textSecondary};">${copy.cohortBody}</td></tr>

      ${renderDivider()}

      <tr><td class="t-secondary" style="font-family:${FONT};font-size:15px;line-height:1.6;color:${C.textSecondary};">
        ${copy.signOff}<br>
        <strong class="t-primary" style="color:${C.text};">${copy.signature}</strong><br>
        <span class="t-muted" style="font-size:13px;color:${C.muted};">${copy.signatureRole}</span>
      </td></tr>

    </table>
  </td></tr>

  <tr><td class="t-muted" style="padding:24px 8px 0 8px;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.muted};">
    ${copy.footerCadence}<br>
    <a href="${urls.unsubscribe}" style="color:${C.muted};text-decoration:underline;">${copy.unsubscribeLabel}</a><span style="color:${C.border};"> · </span><a href="${SITE_URL}" style="color:${C.muted};text-decoration:underline;">rulocode.com</a>
  </td></tr>

</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</div>
</body>
</html>`,
  };
};
