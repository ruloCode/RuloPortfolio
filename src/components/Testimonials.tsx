"use client";

import { Avatar, Card, Column, Heading, Text, Flex, Grid } from "@/once-ui/components";
import { testimonials } from "@/app/resources/content";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

export function Testimonials() {
  if (!testimonials.display) return null;

  return (
    <Column fillWidth gap="l">
      <Heading as="h2" variant="display-strong-s">
        {testimonials.title}
      </Heading>
      
      <Grid 
        columns="3" 
        tabletColumns="2" 
        mobileColumns="1" 
        gap="l" 
        fillWidth
      >
        {testimonials.items.map((testimonial: Testimonial, index: number) => (
          <Card 
            key={index}
            padding="l"
            radius="l"
          >
            <Column gap="m" fillWidth>
              <Text 
                variant="body-default-m"
                style={{ fontStyle: 'italic', lineHeight: 1.6 }}
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
      </Grid>
    </Column>
  );
}
