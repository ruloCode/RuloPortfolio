import { InlineCode } from "@/once-ui/components";
import { scheduling } from "./config";

const person = {
  firstName: "Andrés",
  lastName: "Santana",
  get name() {
    return `${this.firstName} ${this.lastName}`;
  },
  role: "Senior Frontend Engineer | React & Next.js | Fintech & Scalable Applications",
  avatar: "/images/avatar.jpg",
  location: "America/Bogota",
  languages: ["Spanish (Native)", "English (Professional)"],
  email: "drew.lizcano@gmail.com",
  github: "ruloCode",
  linkedin: "https://www.linkedin.com/in/rulocode/",
};

const newsletter = {
  display: false,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: (
    <>
      I occasionally write about Web Development, technology, and share thoughts on the intersection of
      creativity and engineering.
    </>
  ),
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

const home = {
  label: "Home",
  title: `Andrés Santana | Senior React & Next.js Developer | Fintech & Scalable Applications`,
  description: `Senior Frontend Engineer specializing in React, Next.js & TypeScript. 5+ years building scalable applications for healthcare and financial platforms. $2M+/month in transactions processed.`,
  headline: <>I build high-performance frontends that handle millions in transactions.</>,
  openToWork: true,
  subline: (
    <>
      Senior Frontend Engineer specializing in React, Next.js & TypeScript. 5+ years building scalable applications for healthcare and financial platforms. <strong>$2M+/month</strong> in transactions processed. <strong>50K+ users</strong> served. <strong>Zero downtime</strong> migrations.
    </>
  ),
};

const testimonials = {
  display: true,
  title: "What People Say",
  items: [
    {
      quote: "Andrés transformed our checkout flow and reduced load times by 56%. The impact on conversions was immediate—we saw a 23% increase within weeks. He doesn't just write code, he understands business.",
      name: "Diego Martínez",
      role: "CTO, Vitau",
      avatar: "/images/testimonials/diego.png",
    },
    {
      quote: "Working with Andrés was a game-changer. He took our outdated React app and migrated it to Next.js with zero downtime. Our dev team's productivity doubled thanks to the new architecture.",
      name: "Carolina Reyes",
      role: "Product Manager, Healthcare Startup",
      avatar: "/images/testimonials/carolina.png",
    },
    {
      quote: "The experience with Andrés has been excellent. He transformed our branding and helped us grow sales 75% in three months. We continue working hand in hand on every project.",
      name: "Álvaro Pérez",
      role: "Founder, Clandestine",
      avatar: "/images/testimonials/alvaro.png",
    },
  ],
};

const about = {
  label: "About",
  title: "About me",
  description: `Meet ${person.name}, ${person.role} from ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: true,
    link: scheduling.link,
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        Most developers build features. <strong>I build revenue.</strong>
        <br /><br />
        For 4+ years, I've been the frontend lead at Mexico's fastest-growing digital pharmacy. When I joined, the site took 5.8 seconds to load. Users bounced. Sales stalled. I fixed that—cutting load time by 56% and driving a <strong>23% conversion lift</strong>.
        <br /><br />
        Today, the platform I architected processes <strong>$2M+ monthly</strong>, serves 50,000+ patients, and maintains 99.9% uptime. I led the Next.js 15 migration with zero downtime while the team shipped features in parallel.
        <br /><br />
        I work best with teams who care about <strong>speed, conversions, and code that scales</strong>. If that's you, let's talk.
      </>
    ),
  },
  work: {
    display: true,
    title: "Work Experience",
    experiences: [
      {
        company: "Vitau",
        timeframe: "2020 - Present",
        role: "Senior Frontend Engineer & Tech Lead",
        achievements: [
          <>
            Led frontend architecture for Mexico's fastest-growing digital pharmacy, serving <strong>50,000+ patients</strong> with chronic conditions.
          </>,
          <>
            Reduced LCP from 5.8s to 2.5s (<strong>-56%</strong>), directly improving conversion rates by <strong>23%</strong>.
          </>,
          <>
            Architected modular checkout system processing <strong>$2M+ monthly</strong> in transactions with 99.9% uptime.
          </>,
          <>
            Led migration from legacy React to Next.js 15 with <strong>zero downtime</strong>, reducing bundle size by 40%.
          </>,
        ],
        images: [],
      },
      {
        company: "Freelance",
        timeframe: "2019 - Present",
        role: "Frontend Developer & Consultant",
        achievements: [
          <>
            Delivered 10+ projects for startups and SMBs across e-commerce, SaaS, and real estate industries.
          </>,
          <>
            Built end-to-end web platforms from Figma designs to production deployment on Vercel.
          </>,
        ],
        images: [],
      },
    ],
  },
  studies: {
    display: true, // set to false to hide this section
    title: "Studies",
    institutions: [
      {
        name: "Platzi",
        description: <>Studied software engineering.</>,
      },
      {
        name: "Google & MinTic",
        description: <>Studied cybersecurity.</>,
      },
    ],
  },
  technical: {
    display: true, // set to false to hide this section
    title: "Technical Skills",
    skills: [
      {
        title: "React / Next.js",
        description: <>Building production applications with React 18+ and Next.js App Router. Experienced with Server Components, Streaming, Parallel Routes, and ISR for high-performance, SEO-optimized frontends.</>,
      },
      {
        title: "TypeScript",
        description: <>Strict TypeScript across the full stack. Type-safe API contracts, generic utility types, and end-to-end type safety from database schemas to UI components. Reduces runtime errors and accelerates team velocity.</>,
      },
      {
        title: "GraphQL",
        description: <>Designing and consuming GraphQL APIs with Apollo Client and codegen for fully typed queries. Real-time subscriptions for live data feeds, optimistic UI updates, and efficient cache management for complex financial data.</>,
      },
      {
        title: "State Management (XState)",
        description: <>Modeling complex UI flows with finite state machines using XState. Ideal for multi-step checkout processes, payment flows, and approval workflows where predictable state transitions are critical.</>,
      },
      {
        title: "AWS",
        description: <>Deploying and scaling frontend infrastructure on AWS. Experience with S3 + CloudFront for static assets, Lambda@Edge for dynamic rendering, and Amplify for full-stack deployments with CI/CD integration.</>,
      },
      {
        title: "Performance Optimization",
        description: <>Systematic approach to Core Web Vitals: code-splitting, lazy loading, image optimization (WebP/AVIF), critical CSS inlining, and caching strategies. Proven track record reducing LCP by 56% on high-traffic platforms.</>,
      },
      {
        title: "CI/CD & DevOps",
        description: <>Automated pipelines with GitHub Actions, Vercel, and AWS. Feature branch previews, automated testing gates, Lighthouse CI budgets, and zero-downtime deployments for production applications.</>,
      },
      {
        title: "Tailwind CSS",
        description: <>Utility-first styling with Tailwind CSS for rapid, consistent UI development. Custom design system tokens, responsive layouts, and component-level theming integrated with design tools like Figma.</>,
      },
    ],
  }

};

const blog = {
  label: "Blog",
  title: "Writing about frontend, performance & fintech",
  description: `Technical articles and insights on React, Next.js, GraphQL, and building scalable financial applications.`,
};

const work = {
  label: "Work",
  title: "Selected Projects",
  description: `Fintech dashboards, healthcare platforms, and high-performance web applications I've built.`,
};

const services = {
  label: "Services",
  title: "Work With Me",
  description: `Frontend development, performance optimization, and scalable fintech solutions. Let's build something great together.`,
};

const gallery = {
  label: "Gallery",
  title: "My photo gallery",
  description: `A photo collection by ${person.name}`,
  // Images from https://pexels.com
  images: [
    {
      src: "/images/gallery/img-01.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img-02.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-03.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img-04.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-05.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-06.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img-07.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-08.jpg",
      alt: "image",
      orientation: "vertical",
    },


  ],
};

export { person, social, newsletter, home, about, blog, work, services, gallery, testimonials };
