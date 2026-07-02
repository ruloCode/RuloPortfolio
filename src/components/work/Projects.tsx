import { getPosts } from "@/app/utils/utils";
import { Column } from "@/once-ui/components";
import { ProjectCard } from "@/components";
import { localizeHref } from "@/i18n/routing";

interface ProjectsProps {
  range?: [number, number?];
  locale?: string;
}

export function Projects({ range, locale = "en" }: ProjectsProps) {
  let allProjects = getPosts(["src", "app", "[locale]", "work", "projects"], locale);

  const sortedProjects = allProjects.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  const displayedProjects = range
    ? sortedProjects.slice(range[0] - 1, range[1] ?? sortedProjects.length)
    : sortedProjects;

  return (
    <Column fillWidth gap="xl" marginBottom="40">
      {displayedProjects.map((post, index) => (
        <ProjectCard
          priority={index < 2}
          key={post.slug}
          href={localizeHref(locale, `/work/${post.slug}`)}
          images={post.metadata.images}
          title={post.metadata.title}
          description={post.metadata.summary}
          content={post.content}
          team={post.metadata.team}
          link={post.metadata.link || ""}
        />
      ))}
    </Column>
  );
}
