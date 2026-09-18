const whatsappNumber = (process.env.CONTACT_WHATSAPP ?? "")
  .trim()
  .replace(/[+\s()-]/g, "");

export const site = {
  // Public contact address, read on the server and passed to the form.
  email: process.env.CONTACT_EMAIL ?? "",
  whatsappUrl: /^[1-9]\d{7,14}$/.test(whatsappNumber)
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Salut! Aș vrea să discutăm despre un proiect pentru afacerea mea.")}`
    : "",
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
