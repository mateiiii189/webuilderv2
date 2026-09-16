export const site = {
  // Public contact address, read on the server and passed to the form.
  email: process.env.CONTACT_EMAIL ?? "",
};

export const navigation = [
  { label: "Proiecte", id: "proiecte" },
  { label: "Servicii", id: "servicii" },
  { label: "Proces", id: "proces" },
] as const;

export function navigationFor(innerPage: boolean) {
  return navigation.map(({ label, id }) => ({
    label,
    href: innerPage ? `/?section=${id}` : `#${id}`,
  }));
}
