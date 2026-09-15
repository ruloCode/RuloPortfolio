import { scheduling } from "./config";
import brand from "@/styles/brand.module.scss";

const strong = (chunks) => <strong>{chunks}</strong>;

// <fx>keyword</fx> in messages renders as the brand-signature gradient word —
// the single visual signature shared by every page's H1.
const fx = (chunks) => <span className={brand.gradientText}>{chunks}</span>;

const createI18nContent = (t) => {
  // Numbered message lists ("1", "2", ...) read until the first gap, so adding
  // a bullet is a messages-only change — no counts hardcoded in this file.
  const listOf = (path, read = t) => {
    const items = [];
    for (let i = 1; i <= 12; i++) {
      const key = path(i);
      if (!t.has(key)) break;
      items.push(read(key));
    }
    return items;
  };

  const person = {
    firstName: "Andrés",
    lastName: "Santana",
    get name() {
      return `${this.firstName} ${this.lastName}`;
    },
    role: t("person.role"),
    avatar: "/images/avatar.jpg",
    location: "America/Bogota",
    languages: [t("person.languages.spanish"), t("person.languages.english")],
    email: "drew.lizcano@gmail.com",
    github: "ruloCode",
    linkedin: "https://www.linkedin.com/in/rulocode/",
  };

  const social = [
    // Links are automatically displayed.
    // Import new icons in /once-ui/icons.ts
    {
      name: "GitHub",
      icon: "github",
      link: "https://github.com/ruloCode",
    },
    {
      name: "LinkedIn",
      icon: "linkedin",
      link: "https://www.linkedin.com/in/rulocode/",
    },
    {
      name: "Email",
      icon: "email",
      link: "mailto:drew.lizcano@gmail.com",
    },
    {
      name: "YouTube",
      icon: "youtube",
      link: "https://www.youtube.com/@ruloCode",
    },
  ];

  // The newsletter band (blog index and every post). Same API as the
  // waitlist — one table, one welcome flow — tagged source "newsletter".
  const newsletter = {
    title: t("newsletter.title"),
    description: t("newsletter.description"),
    button: t("newsletter.button"),
    placeholder: t("newsletter.placeholder"),
    note: t("newsletter.note"),
    imageAlt: t("newsletter.imageAlt"),
    invalidEmail: t("ia.waitlist.invalidEmail"),
    success: t("newsletter.success"),
    error: t("ia.waitlist.error"),
  };

  // The site-wide waitlist block (primary conversion) — same copy everywhere.
  const waitlist = {
    title: t("ia.waitlist.title"),
    description: t("ia.waitlist.description"),
    button: t("ia.waitlist.button"),
    placeholder: t("ia.waitlist.placeholder"),
    namePlaceholder: t("ia.waitlist.namePlaceholder"),
    invalidName: t("ia.waitlist.invalidName"),
    invalidEmail: t("ia.waitlist.invalidEmail"),
    success: t("ia.waitlist.success"),
    successNamed: t.raw("ia.waitlist.successNamed"),
    successDescription: t("ia.waitlist.successDescription"),
    successCta: t("ia.waitlist.successCta"),
    error: t("ia.waitlist.error"),
    note: t("ia.waitlist.note"),
  };

  const home = {
    label: t("home.label"),
    title: t("home.title"),
    description: t("home.description"),
    headline: t.rich("home.headline", { fx }),
    heroAlt: t("home.heroAlt"),
    heroBadge: t("home.heroBadge"),
    heroCaption: t("home.heroCaption"),
    stackLabel: t("home.stackLabel"),
    blogHeading: t("home.blogHeading"),
    proofHeading: t("home.proofHeading"),
    proofCta: t("home.proofCta"),
    ctaCompanies: t("home.ctaCompanies"),
    ctaProfessionals: t("home.ctaProfessionals"),
    ctaStory: t("home.ctaStory"),
    subline: t.rich("home.subline", { strong }),
    story: {
      eyebrow: t("home.story.eyebrow"),
      title: t("home.story.title"),
      p1: t("home.story.p1"),
      p2: t("home.story.p2"),
      cta: t("home.story.cta"),
      imageAlt: t("home.story.imageAlt"),
    },
    pillars: {
      title: t("home.pillars.title"),
      items: [
        { key: "training", icon: "graduationCap", route: "/ia" },
        { key: "automation", icon: "robot", route: "/services" },
        { key: "development", icon: "rocket", route: "/services" },
      ].map(({ key, icon, route }) => ({
        key,
        icon,
        route,
        image: `/images/home/pillar-${key}.jpg`,
        title: t(`home.pillars.items.${key}.title`),
        description: t(`home.pillars.items.${key}.description`),
        cta: t(`home.pillars.items.${key}.cta`),
      })),
    },
    finalCta: {
      title: t("home.finalCta.title"),
      description: t("home.finalCta.description"),
      button: t("home.finalCta.button"),
    },
  };

  const testimonials = {
    display: true,
    title: t("testimonials.title"),
    items: ["diego", "carolina", "alvaro"].map((key) => ({
      quote: t(`testimonials.items.${key}.quote`),
      name: t(`testimonials.items.${key}.name`),
      role: t(`testimonials.items.${key}.role`),
      avatar: `/images/testimonials/${key}.png`,
    })),
  };

  const about = {
    label: t("about.label"),
    title: t("about.title"),
    description: t("about.description"),
    tableOfContent: {
      display: true,
      subItems: false,
    },
    hero: {
      eyebrow: t("about.hero.eyebrow"),
      title: t.rich("about.hero.title", { fx }),
      intro: t("about.hero.intro"),
      ctaCall: t("about.hero.ctaCall"),
      ctaProgram: t("about.hero.ctaProgram"),
      portraitAlt: t("about.hero.portraitAlt"),
      location: t("about.hero.location"),
    },
    calendar: {
      display: true,
      text: t("about.calendar"),
      link: scheduling.link,
    },
    story: {
      display: true,
      title: t("about.story.title"),
      eyebrow: t("about.story.eyebrow"),
      quote: t("about.story.quote"),
      north: t("about.story.north"),
      acts: Object.fromEntries(
        ["before", "learn", "production", "today"].map((key) => [
          key,
          {
            label: t(`about.story.acts.${key}.label`),
            title: t(`about.story.acts.${key}.title`),
            body: t(`about.story.acts.${key}.body`),
          },
        ]),
      ),
    },
    // The three service lines, in the vocabulary clients search for.
    help: {
      display: true,
      eyebrow: t("about.help.eyebrow"),
      title: t("about.help.title"),
      intro: t("about.help.intro"),
      items: [
        { key: "automation", icon: "robot", route: "/services" },
        { key: "development", icon: "rocket", route: "/work" },
        { key: "training", icon: "graduationCap", route: "/ia" },
      ].map(({ key, icon, route }) => ({
        key,
        icon,
        route,
        title: t(`about.help.items.${key}.title`),
        body: t(`about.help.items.${key}.body`),
        cta: t(`about.help.items.${key}.cta`),
        tags: listOf((i) => `about.help.items.${key}.tags.${i}`),
      })),
    },
    achievements: {
      display: true,
      title: t("achievements.title"),
    },
    work: {
      display: true,
      title: t("about.work.title"),
      // Newest first: what he does today leads.
      experiences: ["aishift", "vitau", "freelance"].map((key) => ({
        company: t(`about.work.experiences.${key}.company`),
        timeframe: t(`about.work.experiences.${key}.timeframe`),
        role: t(`about.work.experiences.${key}.role`),
        achievements: listOf(
          (i) => `about.work.experiences.${key}.achievements.${i}`,
          (path) => t.rich(path, { strong }),
        ),
        images: [],
      })),
    },
    studies: {
      display: true,
      title: t("about.studies.title"),
      institutions: ["platzi", "google", "learning"].map((key) => ({
        name: t(`about.studies.institutions.${key}.name`),
        description: t(`about.studies.institutions.${key}.description`),
      })),
    },
    stack: {
      display: true,
      eyebrow: t("about.stack.eyebrow"),
      title: t("about.stack.title"),
      intro: t("about.stack.intro"),
      groups: ["ai", "frontend", "platform"].map((key) => ({
        key,
        title: t(`about.stack.groups.${key}.title`),
        items: listOf((i) => `about.stack.groups.${key}.items.${i}`),
      })),
    },
    toc: ["story", "help", "work", "achievements", "studies", "stack"].reduce(
      (acc, key) => ({ ...acc, [key]: t(`about.toc.${key}`) }),
      {},
    ),
  };

  const blog = {
    label: t("blog.label"),
    title: t("blog.title"),
    description: t("blog.description"),
  };

  const work = {
    label: t("work.label"),
    title: t("work.title"),
    description: t("work.description"),
  };

  const services = {
    label: t("services.label"),
    title: t("services.title"),
    description: t("services.description"),
    hero: {
      title: t.rich("services.hero.title", { fx }),
      intro: t("services.hero.intro"),
      imageAlt: t("services.hero.imageAlt"),
    },
    offerings: {
      title: t("services.offerings.title"),
      items: ["automation", "frontend", "performance", "consulting"].map((key) => ({
        key,
        title: t(`services.offerings.${key}.title`),
        description: t(`services.offerings.${key}.description`),
        bestFor: t(`services.offerings.${key}.bestFor`),
      })),
    },
    process: {
      title: t("services.process.title"),
      steps: [1, 2, 3, 4].map((i) => ({
        title: t(`services.process.steps.${i}.title`),
        description: t(`services.process.steps.${i}.description`),
      })),
    },
    engagement: {
      title: t("services.engagement.title"),
      items: ["project", "retainer", "consulting"].map((key) => ({
        key,
        highlight: key === "retainer",
        badge: key === "retainer" ? t("services.engagement.retainer.badge") : undefined,
        title: t(`services.engagement.${key}.title`),
        description: t(`services.engagement.${key}.description`),
      })),
    },
    faq: {
      title: t("services.faq.title"),
      items: [1, 2, 3, 4, 5].map((i) => ({
        question: t(`services.faq.items.${i}.question`),
        answer: t(`services.faq.items.${i}.answer`),
      })),
    },
    bridge: {
      title: t("services.bridge.title"),
      description: t("services.bridge.description"),
      cta: t("services.bridge.cta"),
    },
    cta: {
      title: t("services.cta.title"),
      description: t("services.cta.description"),
      button: t("services.cta.button"),
      link: scheduling.link,
    },
  };

  const gallery = {
    label: t("gallery.label"),
    title: t("gallery.title"),
    description: t("gallery.description"),
    // Images from https://pexels.com
    images: [
      { src: "/images/gallery/img-01.jpg", alt: "image", orientation: "vertical" },
      { src: "/images/gallery/img-02.jpg", alt: "image", orientation: "horizontal" },
      { src: "/images/gallery/img-03.jpg", alt: "image", orientation: "vertical" },
      { src: "/images/gallery/img-04.jpg", alt: "image", orientation: "horizontal" },
      { src: "/images/gallery/img-05.jpg", alt: "image", orientation: "horizontal" },
      { src: "/images/gallery/img-06.jpg", alt: "image", orientation: "vertical" },
      { src: "/images/gallery/img-07.jpg", alt: "image", orientation: "horizontal" },
      { src: "/images/gallery/img-08.jpg", alt: "image", orientation: "vertical" },
    ],
  };

  return {
    person,
    social,
    newsletter,
    waitlist,
    home,
    about,
    blog,
    work,
    services,
    gallery,
    testimonials,
  };
};

export { createI18nContent };
