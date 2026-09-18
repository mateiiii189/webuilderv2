import { defineArrayMember, defineField, defineType } from "sanity";
import { projectCategories } from "@/lib/project-types";

const imageFields = [
  defineField({
    name: "alt",
    title: "Descriere pentru accesibilitate",
    type: "string",
    validation: (rule) => rule.required().max(200),
  }),
  defineField({
    name: "caption",
    title: "Legendă (opțional)",
    type: "string",
    validation: (rule) => rule.max(240),
  }),
];

export const projectType = defineType({
  name: "project",
  title: "Proiect",
  type: "document",
  groups: [
    { name: "overview", title: "Prezentare", default: true },
    { name: "story", title: "Studiu de caz" },
    { name: "media", title: "Imagini" },
    { name: "publishing", title: "Publicare" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Nume proiect",
      type: "string",
      group: "overview",
      validation: (rule) => rule.required().max(90),
    }),
    defineField({
      name: "slug",
      title: "Adresă pagină",
      type: "slug",
      group: "overview",
      options: { source: "title", maxLength: 96 },
      validation: (rule) =>
        rule
          .required()
          .custom(
            (value) =>
              !value?.current ||
              /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) ||
              "Folosește litere mici, cifre și cratime.",
          ),
    }),
    defineField({
      name: "categoryId",
      title: "Categorie",
      type: "string",
      group: "overview",
      options: {
        list: projectCategories.map(({ id, label }) => ({
          title: label,
          value: id,
        })),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Discipline",
      description: "Exemplu: Web design / Development",
      type: "string",
      group: "overview",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "summary",
      title: "Descriere scurtă",
      type: "text",
      rows: 3,
      group: "overview",
      validation: (rule) => rule.required().max(320),
    }),
    defineField({
      name: "isConcept",
      title: "Concept demonstrativ",
      type: "boolean",
      group: "overview",
      initialValue: false,
    }),
    defineField({
      name: "clientName",
      title: "Client (opțional)",
      type: "string",
      group: "overview",
      hidden: ({ document }) => Boolean(document?.isConcept),
      validation: (rule) => rule.max(100),
    }),
    defineField({
      name: "headline",
      title: "Titlul paginii",
      type: "array",
      group: "story",
      description:
        "Unul sau două rânduri scurte. Textul se adaptează și pe ecrane mici.",
      of: [
        defineArrayMember({
          type: "string",
          validation: (rule) => rule.max(60),
        }),
      ],
      validation: (rule) => rule.required().min(1).max(2),
    }),
    defineField({
      name: "direction",
      title: "Titlu — ideea din spate",
      type: "string",
      group: "story",
      validation: (rule) => rule.required().max(140),
    }),
    defineField({
      name: "brief",
      title: "Povestea proiectului",
      type: "text",
      rows: 6,
      group: "story",
      validation: (rule) => rule.required().max(3000),
    }),
    defineField({
      name: "decisions",
      title: "Decizii de design și implementare",
      type: "array",
      group: "story",
      of: [
        defineArrayMember({
          type: "object",
          name: "decision",
          fields: [
            defineField({
              name: "title",
              title: "Titlu",
              type: "string",
              validation: (rule) => rule.required().max(100),
            }),
            defineField({
              name: "description",
              title: "Explicație",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required().max(900),
            }),
          ],
        }),
      ],
      validation: (rule) => rule.max(8),
    }),
    defineField({
      name: "cover",
      title: "Copertă",
      type: "image",
      group: "media",
      options: { hotspot: true },
      fields: imageFields,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "gallery",
      title: "Galerie",
      description:
        "Capturi desktop și mobile. Trage imaginile pentru a le reordona.",
      type: "array",
      group: "media",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: imageFields,
        }),
      ],
      validation: (rule) => rule.max(12),
    }),
    defineField({
      name: "liveUrl",
      title: "Website / demo live (opțional)",
      type: "url",
      group: "publishing",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "featured",
      title: "Afișează pe homepage",
      type: "boolean",
      group: "publishing",
      initialValue: false,
      description:
        "Homepage-ul afișează cel mult două proiecte selectate, în ordinea de mai jos.",
    }),
    defineField({
      name: "featuredOrder",
      title: "Ordine pe homepage",
      type: "number",
      group: "publishing",
      initialValue: 0,
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "publishedAt",
      title: "Data proiectului",
      description:
        "Portofoliul afișează proiectele de la cel mai recent la cel mai vechi. Apasă Publish pentru a le face vizibile.",
      type: "datetime",
      group: "publishing",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Cele mai recente",
      name: "recent",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "Ordine homepage",
      name: "featured",
      by: [{ field: "featuredOrder", direction: "asc" }],
    },
  ],
  preview: { select: { title: "title", subtitle: "category", media: "cover" } },
});
