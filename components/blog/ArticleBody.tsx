import { PortableText, type PortableTextComponents } from "next-sanity";
import {
  headingId,
  type BlogBlock,
  type BlogImageBlock,
} from "@/lib/blog-types";
import ArticleImage from "./ArticleImage";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="my-6">{children}</p>,
    h2: ({ children, value }) => (
      <h2
        id={value._key ? headingId(value._key) : undefined}
        className="mt-12 mb-5 scroll-mt-32 text-[clamp(28px,3vw,38px)] leading-tight font-medium tracking-heading text-foreground"
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-4 text-2xl leading-tight font-medium tracking-heading text-foreground">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-9 border-l-2 border-primary pl-6 text-xl text-foreground">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-6 list-disc space-y-3 pl-6 marker:text-primary">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="my-6 list-decimal space-y-3 pl-6 marker:text-primary">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    code: ({ children }) => (
      <code className="rounded bg-surface px-1.5 py-1 text-[0.9em] text-foreground">
        {children}
      </code>
    ),
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "";
      if (
        !/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(href) ||
        /[\u0000-\u0020\\]/.test(href)
      )
        return <>{children}</>;
      return (
        <a
          href={href}
          className="text-foreground underline decoration-primary/60 underline-offset-4 transition-colors duration-300 hover:text-primary"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }: { value: BlogImageBlock }) =>
      value.asset?._ref ? (
        <figure className="my-9">
          <ArticleImage image={value} inline />
          {value.caption && (
            <figcaption className="mt-3 text-sm leading-relaxed text-muted">
              {value.caption}
            </figcaption>
          )}
        </figure>
      ) : null,
  },
};
export default function ArticleBody({ body }: { body: BlogBlock[] }) {
  return (
    <div className="text-[17px] leading-[1.85] wrap-anywhere text-soft [&>p:first-child]:mt-0">
      <PortableText value={body} components={components} />
    </div>
  );
}
