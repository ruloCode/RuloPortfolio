// Add baseURL definition
const baseURL = "rulocode.com";

const routes = {
  "/": true,
  "/about": true,
  // Hidden while the site focuses on the /ia funnel — flip to true to bring them back.
  "/work": false,
  "/services": true,
  "/ia": true,
  "/blog": false,
  // Hidden until there are real photos (e.g. from the Bogotá pilot event) — flip to true to bring it back.
  "/gallery": false,
  // Gated study platform. Access is enforced by the session check in
  // dashboard/layout.tsx — this flag only decides whether the route exists.
  "/dashboard": true,
};

// Scheduling link for consulting CTAs (about, services, home, footer).
// Set NEXT_PUBLIC_CAL_LINK (e.g. https://cal.com/<username>/30min) to switch to Cal.com.
const scheduling = {
  link: process.env.NEXT_PUBLIC_CAL_LINK || "https://calendly.com/rulocode/30min",
};

const style = {
  theme: "dark", // dark | light
  neutral: "slate", // sand | gray | slate
  brand: "emerald", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
  accent: "cyan", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
  solid: "contrast", // color | contrast
  solidStyle: "flat", // flat | plastic
  border: "playful", // rounded | playful | conservative
  surface: "translucent", // filled | translucent
  transition: "all", // all | micro | macro
};

const effects = {
  mask: {
    cursor: true,
    x: 0,
    y: 0,
    radius: 75,
  },
  gradient: {
    display: true,
    x: 50,
    y: 0,
    width: 100,
    height: 100,
    tilt: 0,
    colorStart: "brand-background-strong",
    colorEnd: "static-transparent",
    opacity: 50,
  },
  dots: {
    display: true,
    size: 2,
    color: "brand-on-background-weak",
    opacity: 10,
  },
  lines: {
    display: false,
    color: "neutral-alpha-weak",
    opacity: 100,
  },
  grid: {
    display: true,
    color: "neutral-alpha-weak",
    opacity: 30,
  },
};

const display = {
  location: false,
  time: false,
};

// Decorative background of the waitlist block (WaitlistForm). Submissions go
// to /api/waitlist (Resend) — see .env.example for the required keys.
const waitlistEffects = {
  mask: {
    cursor: false,
    x: 100,
    y: 0,
    radius: 100,
  },
  gradient: {
    display: true,
    x: 100,
    y: 50,
    width: 100,
    height: 100,
    tilt: -45,
    colorStart: "brand-background-strong",
    colorEnd: "static-transparent",
    opacity: 100,
  },
  dots: {
    display: false,
    size: 24,
    color: "brand-on-background-weak",
    opacity: 100,
  },
  lines: {
    display: false,
    color: "neutral-alpha-weak",
    opacity: 100,
  },
  grid: {
    display: true,
    color: "neutral-alpha-weak",
    opacity: 100,
  },
};

export {
  routes,
  scheduling,
  effects,
  style,
  display,
  waitlistEffects,
  baseURL,
};
