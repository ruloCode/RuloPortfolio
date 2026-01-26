import { InlineCode } from "@/once-ui/components";

const person = {
  firstName: "Andrés",
  lastName: "Santana",
  get name() {
    return `${this.firstName} ${this.lastName}`;
  },
  role: "Senior Frontend Engineer | React & Next.js | E-commerce",
  avatar: "/images/avatar.jpg",
  location: "America/Bogota",
  languages: ["Spanish (Native)", "English (Professional)"],
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
  title: `Andrés Santana | Senior React & Next.js Developer | E-commerce Specialist`,
  description: `Senior Frontend Engineer specializing in React.js, Next.js, and high-performance e-commerce platforms. 4+ years building scalable solutions for healthcare and digital products.`,
  headline: <>I build e-commerce that converts</>,
  subline: (
    <>
      Senior Frontend Engineer with 4+ years building high-performance platforms in healthcare & e-commerce.
      I help companies <strong>ship faster</strong>, <strong>convert more</strong>, and <strong>scale without breaking</strong>.
    </>
  ),
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
    link: "https://calendly.com/rulocode/30min",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        I'm Andrés Santana, a <strong>Senior Frontend Engineer</strong> specializing in React.js, Next.js, and e-commerce optimization.
        <br /><br />
        For the past 4+ years, I've been building and scaling a healthcare e-commerce platform that processes <strong>thousands of orders monthly</strong>. My focus: performance, conversion, and developer experience.
        <br /><br />
        I've reduced page load times by <strong>56%</strong>, architected checkout flows handling high-volume transactions, and led migrations to Next.js 15 with zero downtime.
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
        title: "Next.js",
        description: <>Proficient in developing high-performance, server-rendered, and static web applications using Next.js. Experienced with API routes, ISR, SSR, and seamless integration with backend services like Supabase and Firebase.</>,
        images: [
          {
            src: "/images/projects/project-01/cover-04.jpg",
            alt: "Next.js Project",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        title: "Figma",
        description: <>Experienced in UI/UX design and prototyping with Figma, creating high-fidelity mockups, interactive prototypes, and design systems to enhance collaboration between designers and developers.</>,
        images: [
          {
            src: "/images/projects/project-01/figma-2.jpg",
            alt: "Figma Prototype",
            width: 16,
            height: 9,
          },
        ],
      },

      {
        title: "Performance Optimization",
        description: <>Expert in optimizing frontend performance through code-splitting, lazy loading, image optimization, caching strategies, and reducing render-blocking resources to improve Lighthouse scores.</>,
        images: [
          {
            src: "/images/projects/project-01/performance.jpg",
            alt: "Performance Optimization",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        title: "Testing & QA",
        description: <>Skilled in implementing robust testing strategies using Jest, React Testing Library, and Cypress for unit, integration, and end-to-end testing, ensuring code reliability and maintainability.</>,
      },
      {
        title: "CI/CD & DevOps",
        description: <>Experienced in setting up CI/CD pipelines with GitHub Actions, Vercel, and Netlify to automate deployments, enforce code quality, and enhance development efficiency.</>,
      },
    ],
  }

};

const blog = {
  label: "Blog",
  title: "Writing about frontend, performance & e-commerce",
  description: `Technical articles and insights on React, Next.js, and building high-converting web applications.`,
};

const work = {
  label: "Work",
  title: "Selected Projects",
  description: `E-commerce platforms, SaaS dashboards, and high-performance web applications I've built.`,
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

export { person, social, newsletter, home, about, blog, work, gallery };
