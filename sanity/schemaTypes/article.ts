import { defineArrayMember, defineField, defineType } from "sanity";
const imageFields = [
  defineField({
    name: "alt",
    title: "Descriere pentru accesibilitate",
    type: "string",
    validation: (r) => r.required().max(200),
  }),
  defineField({
    name: "caption",
    title: "Legendă (opțional)",
    type: "string",
    validation: (r) => r.max(240),
  }),
];
export const articleType = defineType({
  name: "article",
  title: "Articol",
  type: "document",
  groups: [
    { name: "content", title: "Conținut", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Titlu",
      type: "string",
      group: "content",
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: "slug",
      title: "Adresă articol",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (r) =>
        r
          .required()
          .custom(
            (v) =>
              !v?.current ||
              /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.current) ||
              "Folosește litere mici, cifre și cratime.",
          ),
    }),
    defineField({
      name: "excerpt",
      title: "Introducere scurtă",
      type: "text",
      rows: 3,
      group: "content",
      validation: (r) => r.required().max(320),
    }),
    defineField({
      name: "category",
      title: "Temă",
      type: "string",
      group: "content",
      description:
        "De exemplu: Web design, SEO, Automatizări. Etichetă editorială, fără filtre în pagină.",
      validation: (r) => r.required().max(50),
    }),
    defineField({
      name: "cover",
      title: "Copertă",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: imageFields,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Data publicării",
      type: "datetime",
      group: "content",
      initialValue: () => new Date().toISOString(),
      description:
        "Articolul apare după Publish și după această dată. Actualizarea site-ului poate dura aproximativ un minut.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      title: "Articol",
      type: "array",
      group: "content",
      validation: (r) => r.required().min(1),
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Text", value: "normal" },
            { title: "Titlu secțiune", value: "h2" },
            { title: "Subtitlu", value: "h3" },
            { title: "Citat", value: "blockquote" },
          ],
          lists: [
            { title: "Listă", value: "bullet" },
            { title: "Listă numerotată", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Cod", value: "code" },
            ],
            annotations: [
              defineArrayMember({
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  defineField({
                    name: "href",
                    title: "Adresă",
                    type: "url",
                    validation: (r) =>
                      r.required().uri({
                        allowRelative: true,
                        scheme: ["http", "https", "mailto", "tel"],
                      }),
                  }),
                ],
              }),
            ],
          },
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: imageFields,
        }),
      ],
    }),
    defineField({
      name: "seoTitle",
      title: "Titlu SEO (opțional)",
      description: "Implicit: titlul articolului.",
      type: "string",
      group: "seo",
      validation: (r) => r.max(70),
    }),
    defineField({
      name: "seoDescription",
      title: "Descriere SEO (opțional)",
      description: "Implicit: introducerea scurtă.",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (r) => r.max(170),
    }),
  ],
  orderings: [
    {
      title: "Cele mai recente",
      name: "recent",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: { select: { title: "title", subtitle: "category", media: "cover" } },
});
