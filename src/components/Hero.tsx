"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, FileText, Search, Zap, Clock } from "lucide-react";
import styles from "./Hero.module.css";

type HeroProps = {
  title?: string;                       
  primaryButton?: { text: string; link: string };
  secondaryButton?: { text: string; link: string };         
  processingOptions?: { name: string; time: string }[];
};

const SLIDES = [
  "/baku1.jpg",
  "/baku2.jpg",
  "/baku3.jpg",
];

export function Hero({ title, primaryButton, secondaryButton, processingOptions }: HeroProps) {
  const [cur, setCur] = useState(0);
  const leavingRef = useRef<HTMLDivElement | null>(null);

  const goTo = (next: number) => {
    const el = leavingRef.current;
    if (el) {
      const tx = getComputedStyle(el).transform;
      el.style.transform = tx;
      setTimeout(() => { if (el) el.style.transform = ""; }, 1700);
    }
    setCur(next);
  };

  useEffect(() => {
    const t = setInterval(() => goTo((cur + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur]);

  return (
    <section className={styles.section}>
      {SLIDES.map((src, i) => (
        <div
          key={src}
          ref={i === cur ? leavingRef : null}
          className={`${styles.slide} ${i === cur ? styles.active : styles.inactive}`}
        >
          <div className={styles.backgroundPicture}>
            <Image
              src={src}
              alt={`Azerbaijan scenic backdrop slide ${i + 1}`}
              fill
              priority={i === 0}
              sizes="100vw"
              className={styles.backgroundImage}
              quality={75}
            />
          </div>
        </div>
      ))}

      <div className={styles.overlay} />

      <div className={styles.content}>
        <p className={styles.label}>Official e-Visa Application</p>

        <h1 className={styles.title}>
          {title ?? "Visa Approved in 3 Simple Steps"}
        </h1>

        <div className={styles.ctaContainer}>
          <div className={styles.buttonsRow}>
            <a href="https://apply.azerbaijan-evisa.com/" target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>
              <FileText size={18} />
              {primaryButton?.text ?? "Apply Now"}
              <ArrowRight size={17} strokeWidth={2.5} />
            </a>

            <a href={secondaryButton?.link ?? "/track"} className={styles.secondaryButton}>
              <Search size={18} />
              {secondaryButton?.text ?? "Track Application"}
            </a>
          </div>

          <div className={styles.speedBar}>
            <div className={styles.speedOption}>
              <div className={`${styles.speedIcon} ${styles.urgentIcon}`}>
                <Zap size={18} fill="white" />
              </div>
              <div className={styles.speedText}>
                <p className={styles.speedLabel}>{processingOptions?.[0]?.name ?? "Urgent"}</p>
                <p className={styles.speedValue}>{processingOptions?.[0]?.time ?? "3 Hours"}</p>
              </div>
            </div>

            <div className={styles.speedDivider} />

            <div className={styles.speedOption}>
              <div className={`${styles.speedIcon} ${styles.standardIcon}`}>
                <Clock size={18} fill="white" />
              </div>
              <div className={styles.speedText}>
                <p className={styles.speedLabel}>{processingOptions?.[1]?.name ?? "Standard"}</p>
                <p className={styles.speedValue}>{processingOptions?.[1]?.time ?? "3–5 Business Days"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.dotsContainer}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`${styles.dot} ${i === cur ? styles.active : ""}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <div className={styles.bottomFade} />
    </section>
  );
}
