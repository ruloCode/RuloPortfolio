import { LetterFx } from "@/once-ui/components";
import { scheduling } from "./config";

const strong = (chunks) => <strong>{chunks}</strong>;

// <fx>keyword</fx> in messages renders as a one-word scramble effect.
// LetterFx needs a plain string child, so flatten the rich-text chunks.
const fx = (chunks) => {
  const text = Array.isArray(chunks)
    ? chunks.filter((c) => typeof c === "string").join("")
    : typeof chunks === "string"
      ? chunks
      : "";
  return (
    <LetterFx trigger="instant" speed="fast">
      {text}
    </LetterFx>
  );
};

const createI18nContent = (t) => {
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

  const newsletter = {
    display: false,
    title: t("newsletter.title"),
    description: t("newsletter.description"),
    button: t("newsletter.button"),
    placeholder: t("newsletter.placeholder"),
  };

  const home = {
    label: t("home.label"),
    title: t("home.title"),
    description: t("home.description"),
    headline: t.rich("home.headline", { fx }),
    badge: t("home.badge"),
    blogHeading: t("home.blogHeading"),
    ctaWork: t("home.ctaWork"),
    ctaCall: t("home.ctaCall"),
    openToWork: true,
    subline: t.rich("home.subline", { strong }),
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
    avatar: {
      display: true,
    },
    calendar: {
      display: true,
      text: t("about.calendar"),
      link: scheduling.link,
    },
    intro: {
      display: true,
      title: t("about.intro.title"),
      description: (
        <>
          {t.rich("about.intro.p1", { strong })}
          <br />
          <br />
          {t.rich("about.intro.p2", { strong })}
          <br />
          <br />
          {t.rich("about.intro.p3", { strong })}
          <br />
          <br />
          {t.rich("about.intro.p4", { strong })}
        </>
      ),
    },
    achievements: {
      display: true,
      title: t("achievements.title"),
    },
    work: {
      display: true,
      title: t("about.work.title"),
      experiences: [
        {
          company: t("about.work.experiences.vitau.company"),
          timeframe: t("about.work.experiences.vitau.timeframe"),
          role: t("about.work.experiences.vitau.role"),
          achievements: [1, 2, 3, 4].map((i) =>
            t.rich(`about.work.experiences.vitau.achievements.${i}`, { strong }),
          ),
          images: [],
        },
        {
          company: t("about.work.experiences.freelance.company"),
          timeframe: t("about.work.experiences.freelance.timeframe"),
          role: t("about.work.experiences.freelance.role"),
          achievements: [1, 2].map((i) =>
            t.rich(`about.work.experiences.freelance.achievements.${i}`, { strong }),
          ),
          images: [],
        },
      ],
    },
    studies: {
      display: true,
      title: t("about.studies.title"),
      institutions: ["platzi", "google"].map((key) => ({
        name: t(`about.studies.institutions.${key}.name`),
        description: t(`about.studies.institutions.${key}.description`),
      })),
    },
    technical: {
      display: true,
      title: t("about.technical.title"),
      skills: [
        "react",
        "typescript",
        "graphql",
        "xstate",
        "aws",
        "performance",
        "cicd",
        "tailwind",
      ].map((key) => ({
        title: t(`about.technical.skills.${key}.title`),
        description: t(`about.technical.skills.${key}.description`),
        images: [],
      })),
    },
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
      title: t("services.hero.title"),
      intro: t("services.hero.intro"),
    },
    offerings: {
      title: t("services.offerings.title"),
      items: ["frontend", "performance", "ecommerce", "consulting"].map((key) => ({
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
