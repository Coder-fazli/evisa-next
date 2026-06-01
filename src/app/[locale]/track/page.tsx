import { NavbarServer as Navbar } from "@/components/NavbarServer";
import { Footer7Server as Footer7 } from "@/components/ui/footer-7-server";
import { InfoPageHero } from "@/components/infopage/InfoPageHero";
import { TrackClient } from "./TrackClient";
import styles from "./Track.module.css";
import { localizedUrl } from "@/lib/url";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const base = "https://azerbaijan-evisa.com";

  return {
    title: "Track Application – Azerbaijan e-Visa",
    description: "Check the status of your Azerbaijan e-Visa application by entering your reference number.",
    alternates: {
      languages: {
        en: localizedUrl(base, "en", "/track"),
        es: localizedUrl(base, "es", "/track"),
        ar: localizedUrl(base, "ar", "/track"),
      },
      canonical: localizedUrl(base, locale, "/track"),
    },
  };
}

export default async function TrackPage() {
  return (
    <>
      <Navbar />
      <InfoPageHero
        title="Track Application"
        subtitle="Check your e-Visa application status instantly"
        heroImage="/baku-country-hero.jpg"
      />
      <div className={styles.page}>
        <div className={styles.container}>
          <TrackClient />
        </div>
      </div>
      <Footer7 />
    </>
  );
}
