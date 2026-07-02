const INTL_LOCALES: Record<string, string> = {
  en: "en-US",
  es: "es-CO",
};

export function formatDate(date: string, includeRelative = false, locale = "en") {
  const intlLocale = INTL_LOCALES[locale] ?? locale;
  const currentDate = new Date();

  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }

  const targetDate = new Date(date);

  const fullDate = targetDate.toLocaleString(intlLocale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (!includeRelative) {
    return fullDate;
  }

  const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" });
  const diffMs = targetDate.getTime() - currentDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let relative: string;
  if (Math.abs(diffDays) >= 365) {
    relative = rtf.format(Math.trunc(diffDays / 365), "year");
  } else if (Math.abs(diffDays) >= 30) {
    relative = rtf.format(Math.trunc(diffDays / 30), "month");
  } else {
    relative = rtf.format(diffDays, "day");
  }

  return `${fullDate} (${relative})`;
}
