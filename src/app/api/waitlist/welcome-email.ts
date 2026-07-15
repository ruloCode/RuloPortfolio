// Welcome email sent right after a successful waitlist signup.
// Copy mirrors the tone of the waitlist block in messages/{es,en}.json.

type WelcomeEmail = {
  subject: string;
  html: string;
  text: string;
};

const COPY = {
  es: {
    subject: "Tu cupo está reservado — AI Shift Challenge",
    greeting: "¡Hola!",
    confirmed:
      "Tu lugar en la lista de espera del AI Shift Challenge quedó reservado. Estás dentro de la cohorte fundadora.",
    next: "Cuando abra la cohorte te escribo a este correo — la lista de espera entra primero y con precio de lanzamiento.",
    noSpam: "Cero spam: este es el único correo hasta que haya novedades.",
    signOff: "Nos leemos pronto,",
    signature: "Rulo",
  },
  en: {
    subject: "Your spot is reserved — AI Shift Challenge",
    greeting: "Hey!",
    confirmed:
      "Your spot on the AI Shift Challenge waitlist is reserved. You're part of the founding cohort.",
    next: "When the cohort opens I'll write to this address — the waitlist gets in first, with launch pricing.",
    noSpam: "Zero spam: this is the only email until there's news.",
    signOff: "Talk soon,",
    signature: "Rulo",
  },
} as const;

export type WelcomeLocale = keyof typeof COPY;

export const resolveWelcomeLocale = (locale?: string): WelcomeLocale =>
  locale === "en" ? "en" : "es";

export const buildWelcomeEmail = (locale: WelcomeLocale): WelcomeEmail => {
  const copy = COPY[locale];
  const paragraphs = [copy.confirmed, copy.next, copy.noSpam];

  return {
    subject: copy.subject,
    text: [copy.greeting, ...paragraphs, `${copy.signOff}\n${copy.signature}`].join("\n\n"),
    html: `<!doctype html>
<html lang="${locale}">
  <body style="margin:0;padding:0;background-color:#0f0f10;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f10;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#1a1a1c;border:1px solid #2e2e32;border-radius:12px;padding:40px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <tr>
              <td style="color:#f5f5f5;font-size:22px;font-weight:700;padding-bottom:24px;">
                ${copy.greeting}
              </td>
            </tr>
            ${paragraphs
              .map(
                (p) => `<tr>
              <td style="color:#c9c9cf;font-size:15px;line-height:1.6;padding-bottom:16px;">${p}</td>
            </tr>`,
              )
              .join("\n            ")}
            <tr>
              <td style="color:#c9c9cf;font-size:15px;line-height:1.6;padding-top:8px;">
                ${copy.signOff}<br />
                <strong style="color:#f5f5f5;">${copy.signature}</strong>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
};
