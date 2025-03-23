import { InlineCode } from "@/once-ui/components";

const person = {
  firstName: "Rulo Code",
  lastName: "",
  get name() {
    return `${this.firstName} ${this.lastName}`;
  },
  role: "Software Engineer",
  avatar: "/images/avatar.jpg",
  location: "America/Bogota", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: [], // optional: Leave the array empty if you don't want to display languages
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
  title: `${person.name}'s Portfolio`,
  description: `Portfolio website showcasing my work as a ${person.role}`,
  headline: <>Software engineer and builder</>,
  subline: (
    <>
      I'm Andrés, a software engineer passionate about developing software that solves real-world problems and brings tangible improvements to people's daily experiences.
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
       I'm Andrés Santana, a frontend developer passionate about transforming complex requirements into intuitive and responsive user interfaces. My work spans modern web technologies, responsive design, and the seamless integration of design and technology to create engaging user experiences.
      </>
    ),
  },
  work: {
    display: true, // set to false to hide this section
    title: "Work Experience",
    experiences: [
      {
        company: "Vitau",
        timeframe: "2020 - Present",
        role: "Senior Frontend Engineer",
        achievements: [
          <>
            Led the development and continuous improvement of an e-commerce platform in the health sector as part of a cross-functional team.
          </>,
          <>
            Delivered scalable solutions that enhanced UX and increased the platform’s conversion rate.
          </>,
        ],
        images: [
          // optional: leave the array empty if you don't want to display images
          {
            src: "/images/projects/project-01/cover-01.jpg",
            alt: "Once UI Project",
            width: 16,
            height: 9,
          },
        ],
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
  title: "Writing about Community and tech...",
  description: `Read what ${person.name} has been up to recently`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work = {
  label: "Work",
  title: "My projects",
  description: `Design and dev projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
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
