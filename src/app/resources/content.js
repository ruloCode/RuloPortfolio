// Static, non-translatable data. All translatable content lives in
// messages/{en,es}.json and is assembled by content-i18n.js.
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

const gallery = {
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

export { person, social, gallery };
