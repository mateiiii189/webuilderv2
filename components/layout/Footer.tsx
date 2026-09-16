import Brand from "@/components/ui/Brand";
import { navigationFor } from "@/lib/site";
import { textLink } from "@/lib/ui";

export default function Footer({ innerPage = false }: { innerPage?: boolean }) {
  const links = [
    ...navigationFor(innerPage),
    { label: "Contact", href: "/contact" },
  ];
  return (
    <footer className="border-t border-border">
      <div className="py-8 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:py-[42px]">
        <div>
          <Brand href={innerPage ? "/" : "#top"} />
          <p className="mt-3.5 text-xs text-muted">
            Din București. Oriunde în lume.
          </p>
        </div>
        <nav
          className="mt-6 flex flex-wrap gap-x-6 gap-y-2.5 text-[13px] sm:mt-0 sm:gap-7"
          aria-label="Navigație subsol"
        >
          {links.map((item) => (
            <a className={textLink} key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border py-5 text-kicker text-muted sm:gap-6">
        <span>© {new Date().getFullYear()} Webuilder.</span>
        <span className="hidden sm:block">Viziune. Design. Tehnologie.</span>
        <a className={`${textLink} max-sm:ml-auto`} href="#top">
          Înapoi sus ↑
        </a>
      </div>
    </footer>
  );
}
