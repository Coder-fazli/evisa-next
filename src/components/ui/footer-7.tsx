"use client";

import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import Image from "next/image";
import { useTranslations } from "next-intl";

const socialLinks = [
  { icon: <FaInstagram className="size-5" />, href: "#", label: "Instagram" },
  { icon: <FaFacebook className="size-5" />, href: "#", label: "Facebook" },
  { icon: <FaTwitter className="size-5" />, href: "#", label: "Twitter" },
  { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
];

interface Footer7Props {
  logoUrl?: string | null;
}

export function Footer7({ logoUrl }: Footer7Props = {}) {
  const t = useTranslations();
  const logo = logoUrl || "/evisa-logo.png";

  const sections = [
    {
      title: t("footer.visaServices"),
      links: [
        { name: t("footer.applyEvisa"), href: "/" },
        { name: t("footer.visaRequirements"), href: "/requirements" },
        { name: t("footer.visaTypes"), href: "/visa-types" },
        { name: t("footer.urgentProcessing"), href: "/" },
        { name: t("footer.visaByNationality"), href: "/visa" },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { name: t("footer.aboutUs"), href: "/about" },
        { name: t("footer.blog"), href: "/blog" },
        { name: t("footer.contactUs"), href: "/contact" },
      ],
    },
    {
      title: t("footer.support"),
      links: [
        { name: t("footer.faq"), href: "/faq" },
        { name: t("footer.trackApplication"), href: "/track" },
        { name: t("footer.privacyPolicy"), href: "/privacy" },
        { name: t("footer.termsConditions"), href: "/terms" },
      ],
    },
  ];

  const trustBadges = [
    {
      icon: "🔒",
      title: t("footer.sslSecure"),
      subtitle: t("footer.sslDescription"),
    },
    {
      icon: "💳",
      title: t("footer.pciDss"),
      subtitle: t("footer.pciDescription"),
    },
    {
      icon: "🕐",
      title: t("footer.support24"),
      subtitle: t("footer.supportDescription"),
    },
    {
      icon: "↩️",
      title: t("footer.refundPolicy"),
      subtitle: t("footer.refundDescription"),
    },
  ];
  return (
    <footer className="bg-[#080c18] text-white">
      {/* Trust badges bar */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-[1200px] mx-auto px-6 py-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {trustBadges.map((badge, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl px-4 py-4"
              style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <span className="text-2xl flex-shrink-0">{badge.icon}</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">{badge.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{badge.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-8">
        {/* Top row */}
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-16">
          {/* Brand col */}
          <div className="flex flex-col gap-6 lg:max-w-[260px]">
            <a href="/" className="flex items-center gap-3">
              <Image
                src={logo}
                alt="eVisa Azerbaijan"
                width={120}
                height={40}
                className="h-10 w-auto"
                unoptimized
              />
            </a>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              {t("footer.description")}
            </p>
            <ul className="flex items-center gap-5">
              {socialLinks.map((social, idx) => (
                <li key={idx}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    className="text-white/45 hover:text-[#E8671A] transition-colors"
                  >
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:flex-1">
            {sections.map((section, idx) => (
              <div key={idx}>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-widest" style={{ color: "#E8671A" }}>
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link, lidx) => (
                    <li key={lidx}>
                      <a
                        href={link.href}
                        className="text-sm text-white/55 hover:text-white transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 flex flex-col gap-3 border-t pt-8 text-xs sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)" }}
        >
          <p>{t("footer.copyright")}</p>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-white transition-colors">{t("footer.privacyPolicy")}</a>
            <a href="/terms" className="hover:text-white transition-colors">{t("footer.termsConditions")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
