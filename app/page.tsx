import PageShell from "@/components/layout/PageShell";
import SectionArrival from "@/components/layout/SectionArrival";
import Hero from "@/components/home/Hero";
import HomeSections from "@/components/home/HomeSections";

export default function HomePage() {
  return (
    <PageShell>
      <SectionArrival />
      <Hero />
      <HomeSections />
    </PageShell>
  );
}
