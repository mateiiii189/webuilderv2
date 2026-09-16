import Button from "@/components/ui/Button";
import Brand from "@/components/ui/Brand";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-site flex-col items-start justify-center px-gutter py-16">
      <Brand href="/" />
      <p className="mt-16 mb-5 text-kicker tracking-kicker text-primary">
        404 / PAGINĂ NEGĂSITĂ
      </p>
      <h1 className="max-w-[16ch] text-section leading-[1.12] font-medium tracking-heading">
        O adresă fără destinație.
      </h1>
      <p className="mt-6 mb-8 max-w-[40ch] text-base leading-relaxed text-muted">
        Pagina pe care o cauți nu există sau a fost mutată. Ne întoarcem la
        început?
      </p>
      <Button href="/" variant="secondary" direction="back">
        Înapoi la început
      </Button>
    </main>
  );
}
