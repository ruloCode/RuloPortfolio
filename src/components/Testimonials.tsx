"use client";

import { Avatar, Card, Column, Heading, Text, Flex } from "@/once-ui/components";
import { testimonials } from "@/app/resources/content";
import styles from "./Testimonials.module.scss";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

export function Testimonials() {
  if (!testimonials.display) return null;

  return (
    <Column gap="l" fillWidth className={styles.testimonials}>
      <Heading as="h2" variant="display-strong-s">
        {testimonials.title}
      </Heading>
      
      <div className={styles.grid}>
        {testimonials.items.map((testimonial: Testimonial, index: number) => (
          <Card 
            key={index}
            className={styles.card}
            padding="l"
            radius="l"
          >
            <Column gap="m">
              <Text 
                variant="body-default-m" 
                className={styles.quote}
              >
                "{testimonial.quote}"
              </Text>
              
              <Flex gap="s" vertical="center">
                <Avatar
                  size="m"
                  src={testimonial.avatar}
                />
                <Column gap="2">
                  <Text variant="body-strong-s">
                    {testimonial.name}
                  </Text>
                  <Text 
                    variant="body-default-xs" 
                    onBackground="neutral-weak"
                  >
                    {testimonial.role}
                  </Text>
                </Column>
              </Flex>
            </Column>
          </Card>
        ))}
      </div>
    </Column>
  );
}
