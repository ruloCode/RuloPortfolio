import {
  Avatar,
  Button,
  Column,
  Flex,
  Heading,
  Icon,
  Text,
  Card,
  Grid,
} from "@/once-ui/components";
import { baseURL } from "@/app/resources";
import { person } from "@/app/resources/content";

export async function generateMetadata() {
  const title = "Services | Work With Me";
  const description =
    "Senior Frontend Engineer specializing in React, Next.js, and e-commerce. Project-based development, performance optimization, and technical consulting.";
  const ogImage = `https://${baseURL}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://${baseURL}/services`,
      images: [
        {
          url: ogImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

const services = [
  {
    icon: "code",
    title: "Frontend Development",
    description:
      "Building scalable React & Next.js applications with focus on performance, accessibility, and user experience.",
    bestFor: "Startups shipping MVPs, companies modernizing legacy frontends",
  },
  {
    icon: "lightning",
    title: "Performance Optimization",
    description:
      "Auditing and optimizing existing applications for speed, Core Web Vitals, SEO, and conversion rates.",
    bestFor: "E-commerce sites losing sales to slow load times",
  },
  {
    icon: "cart",
    title: "E-commerce Solutions",
    description:
      "End-to-end checkout flows, payment integrations, and conversion optimization for online stores.",
    bestFor: "Companies selling online who need higher conversion rates",
  },
  {
    icon: "users",
    title: "Technical Consulting",
    description:
      "Architecture reviews, code audits, team mentoring, and technical strategy for growing teams.",
    bestFor: "Startups scaling their engineering team",
  },
];

const engagementModels = [
  {
    model: "Project-based",
    duration: "2-8 weeks",
    bestFor: "Defined scope, fixed budget",
    description: "Clear deliverables with milestone-based payments",
  },
  {
    model: "Monthly Retainer",
    duration: "Ongoing",
    bestFor: "Continuous development needs",
    description: "Dedicated hours each month, flexible priorities",
  },
  {
    model: "Consulting",
    duration: "Hours/Days",
    bestFor: "Architecture review, team mentoring",
    description: "Expert guidance without long-term commitment",
  },
];

const process = [
  {
    step: "01",
    title: "Discovery Call",
    description: "30 min free call to understand your needs, goals, and timeline.",
  },
  {
    step: "02",
    title: "Proposal",
    description: "Detailed scope, timeline, and fixed price. No surprises.",
  },
  {
    step: "03",
    title: "Development",
    description: "Weekly updates, async communication, iterative delivery.",
  },
  {
    step: "04",
    title: "Delivery",
    description: "Deployed, documented, with proper handoff and support.",
  },
];

export default function Services() {
  return (
    <Column maxWidth="m">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            provider: {
              "@type": "Person",
              name: person.name,
              jobTitle: person.role,
            },
            serviceType: "Frontend Development",
            areaServed: "Worldwide",
          }),
        }}
      />

      {/* Hero Section */}
      <Flex direction="column" gap="l" marginBottom="xl">
        <Heading variant="display-strong-l">Work With Me</Heading>
        <Text variant="heading-default-l" onBackground="neutral-weak">
          I help companies build high-performance web applications that convert visitors into customers. 
          From startups shipping their first MVP to enterprises optimizing existing platforms.
        </Text>
      </Flex>

      {/* Services Section */}
      <Flex direction="column" gap="l" marginBottom="xl">
        <Heading as="h2" variant="heading-strong-l">
          What I Do
        </Heading>
        <Flex direction="column" gap="m">
          {services.map((service, index) => (
            <Card key={index} padding="l" radius="l">
              <Flex direction="column" gap="s">
                <Heading as="h3" variant="heading-strong-m">
                  {service.title}
                </Heading>
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {service.description}
                </Text>
                <Text variant="body-default-s" onBackground="brand-weak">
                  <strong>Best for:</strong> {service.bestFor}
                </Text>
              </Flex>
            </Card>
          ))}
        </Flex>
      </Flex>

      {/* Process Section */}
      <Flex direction="column" gap="l" marginBottom="xl">
        <Heading as="h2" variant="heading-strong-l">
          How I Work
        </Heading>
        <Flex direction="column" gap="m">
          {process.map((item, index) => (
            <Flex key={index} gap="m">
              <Text
                variant="heading-strong-l"
                onBackground="brand-weak"
                style={{ minWidth: "48px" }}
              >
                {item.step}
              </Text>
              <Flex direction="column" gap="xs">
                <Heading as="h3" variant="heading-strong-s">
                  {item.title}
                </Heading>
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {item.description}
                </Text>
              </Flex>
            </Flex>
          ))}
        </Flex>
      </Flex>

      {/* Engagement Models */}
      <Flex direction="column" gap="l" marginBottom="xl">
        <Heading as="h2" variant="heading-strong-l">
          Engagement Models
        </Heading>
        <Flex direction="column" gap="m">
          {engagementModels.map((model, index) => (
            <Card key={index} padding="l" radius="l">
              <Flex direction="column" gap="xs">
                <Flex horizontal="space-between">
                  <Heading as="h3" variant="heading-strong-m">
                    {model.model}
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {model.duration}
                  </Text>
                </Flex>
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {model.description}
                </Text>
                <Text variant="body-default-s" onBackground="brand-weak">
                  <strong>Best for:</strong> {model.bestFor}
                </Text>
              </Flex>
            </Card>
          ))}
        </Flex>
      </Flex>

      {/* CTA Section */}
      <Flex
        direction="column"
        gap="m"
        padding="xl"
        radius="l"
        background="brand-weak"
        horizontal="center"
        style={{ textAlign: "center" }}
      >
        <Heading as="h2" variant="heading-strong-l">
          Let's Talk
        </Heading>
        <Text
          variant="body-default-l"
          onBackground="neutral-weak"
          style={{ maxWidth: "500px" }}
        >
          Book a free 30-minute call. No commitment—just a conversation to see if we're a good fit for your project.
        </Text>
        <Button
          href="https://calendly.com/rulocode/30min"
          variant="primary"
          size="l"
        >
          Book a Call
        </Button>
      </Flex>
    </Column>
  );
}
