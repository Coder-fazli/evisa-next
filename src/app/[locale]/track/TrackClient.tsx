"use client";

import { useState } from "react";
import styles from "./Track.module.css";

const APPLY_BASE = "https://apply.azerbaijan-evisa.com";
const API_BASE   = `${APPLY_BASE}/api/track`;

type Field = { label: string; value: string; type: "text" | "image" | "radio" };
type Applicant = {
  index: number;
  status: 0 | 1 | 2;
  fields: Field[];
  files: string[];
};
type TrackResult = {
  apply_id: string;
  total_price: number;
  payment_gateway: string;
  applicants: Applicant[];
};

const STATUS_MAP = {
  0: { label: "Pending Payment", cls: "pending", icon: "⚠️" },
  1: { label: "In Process",      cls: "process", icon: "⏳" },
  2: { label: "Completed",       cls: "done",    icon: "✅" },
} as const;

export function TrackClient() {
  const [refNum, setRefNum]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<TrackResult | null>(null);
  const [error, setError]       = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const id = refNum.trim().replace(/^#/, "");
    if (!id) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Application not found.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Search card */}
      <div className={styles.searchCard}>
        <p className={styles.searchLabel}>Track Your Application</p>
        <h1 className={styles.searchTitle}>Application Status</h1>
        <p className={styles.searchSub}>
          Enter your application reference number to check the current status of your e-Visa application.
        </p>

        <form onSubmit={handleSearch}>
          <div className={styles.searchRow}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="#AZ2024XXXXXXXX"
              value={refNum}
              onChange={e => setRefNum(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <button className={styles.searchBtn} type="submit" disabled={loading || !refNum.trim()}>
              {loading ? "Searching…" : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Search
                </>
              )}
            </button>
          </div>
          {error && <div className={styles.errorMsg}>⚠ {error}</div>}
        </form>
      </div>

      {/* Results */}
      {result && (
        <div>
          <div className={styles.resultsHeader}>
            <div className={styles.refBadge}>
              # <strong>{result.apply_id}</strong>
            </div>
            <div className={styles.totalChip}>
              Total: <span>${result.total_price}</span>
            </div>
          </div>

          {result.applicants.map((applicant) => {
            const st = STATUS_MAP[applicant.status];
            return (
              <div key={applicant.index} className={styles.applicantCard}>
                <div className={styles.applicantHeader}>
                  <div className={styles.applicantTitle}>
                    Applicant {applicant.index}
                  </div>
                  <div className={`${styles.statusBadge} ${styles[st.cls]}`}>
                    {st.icon} {st.label}
                  </div>
                </div>

                <div className={styles.applicantBody}>
                  {applicant.fields.map((field, i) => (
                    <div key={i} className={styles.fieldRow}>
                      <div className={styles.fieldLabel}>{field.label}</div>
                      <div className={styles.fieldValue}>
                        {field.type === "image" ? (
                          <img
                            src={`${APPLY_BASE}/frontAssets/image/passports/${field.value}`}
                            alt={field.label}
                            className={styles.passportThumb}
                          />
                        ) : (
                          field.value || "—"
                        )}
                      </div>
                    </div>
                  ))}

                  {applicant.files.length > 0 && (
                    <div className={styles.docsSection}>
                      <div className={styles.docsTitle}>Attached Documents</div>
                      {applicant.files.map((f, i) => (
                        <a
                          key={i}
                          href={`${APPLY_BASE}/frontAssets/visa_documents/${f}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.docLink}
                        >
                          📎 {f}
                        </a>
                      ))}
                    </div>
                  )}

                  {applicant.status === 0 && (
                    <a
                      href={
                        result.payment_gateway === "stripe"
                          ? `${APPLY_BASE}/payment/${result.apply_id}`
                          : `${APPLY_BASE}/make-payment/${result.apply_id}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.payBtn}
                    >
                      💳 Complete Payment
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
