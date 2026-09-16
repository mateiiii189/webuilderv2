import Header from "@/components/layout/Header";
import PageMotion from "@/components/layout/PageMotion";
import Hero from "@/components/home/Hero";
import HomeSections, {
  Footer,
} from "@/components/home/HomeSections";

export default function HomePage() {
  return (
    <div className="site-shell" id="top">
      <PageMotion />

      <a className="skip-link" href="#main-content">
        Sari la conținut
      </a>

      <Header />

      <main id="main-content" tabIndex={-1}>
        <Hero />
        <HomeSections />
      </main>

      <Footer />
    </div>
  );
}