import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { localizedUrl } from "@/lib/url";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  const localeMap: Record<string, { locale: string; siteName: string; template: string; default: string; description: string }> = {
    es: {
      locale: "es_ES",
      siteName: "eVisa Azerbaiyán",
      template: "%s | eVisa Azerbaiyán",
      default: "eVisa Azerbaiyán – Portal Oficial de Solicitud",
      description: "Solicita tu eVisa de Azerbaiyán en línea. Rápido, seguro y 100% oficial.",
    },
    ar: {
      locale: "ar_SA",
      siteName: "تأشيرة أذربيجان الإلكترونية",
      template: "%s | تأشيرة أذربيجان الإلكترونية",
      default: "تأشيرة أذربيجان الإلكترونية – بوابة التقديم الرسمية",
      description: "قدم طلبك للحصول على تأشيرة أذربيجان الإلكترونية عبر الإنترنت. سريع وآمن و100٪ رسمي.",
    },
  };

  const config = localeMap[locale] || {
    locale: "en_US",
    siteName: "Azerbaijan e-Visa",
    template: "%s | Azerbaijan e-Visa",
    default: "Azerbaijan e-Visa – Official Application Portal",
    description: "Apply for your Azerbaijan e-Visa online. Fast, secure, and 100% official.",
  };

  const baseUrl = "https://azerbaijan-evisa.com";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      template: config.template,
      default: config.default,
    },
    description: config.description,
    openGraph: {
      type: "website",
      locale: config.locale,
      url: localizedUrl(baseUrl, locale, ""),
      siteName: config.siteName,
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    alternates: {
      languages: {
        en: localizedUrl(baseUrl, "en", ""),
        es: localizedUrl(baseUrl, "es", ""),
        ar: localizedUrl(baseUrl, "ar", ""),
      },
    },
  };
}

export default async function RootLayout({ 
  children,
  params,
  }: { 
    children: React.ReactNode; 
    params: Promise<{ locale: string }>;
  }) {
    const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
 
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <div lang={locale} dir={dir}>
      <Providers 
      locale={locale} 
      messages={messages}>
        {children}
      </Providers>
    </div>
  );
}
