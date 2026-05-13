"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const SECTION_CONFIG = [
  { key: "toneAndStyle", label: "Tone & Style" },
  { key: "content", label: "Content" },
  { key: "structure", label: "Structure" },
  { key: "skills", label: "Skills" },
];

function scoreTone(score) {
  if (score >= 85) return "text-emerald-300 border-emerald-500/40 bg-emerald-900/20";
  if (score >= 70) return "text-amber-300 border-amber-500/40 bg-amber-900/20";
  return "text-rose-300 border-rose-500/40 bg-rose-900/20";
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params?.analysisId;

  const [analysisData, setAnalysisData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalysis() {
      setIsLoading(true);
      setLoadError("");

    if (!analysisId || typeof analysisId !== "string") {
        if (isMounted) {
          setLoadError("Invalid analysis id.");
          setIsLoading(false);
        }
      return;
    }

      let hasLocalData = false;
      const raw = sessionStorage.getItem(`resume-analysis:${analysisId}`);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.feedback && isMounted) {
            setAnalysisData(parsed);
            hasLocalData = true;
          }
        } catch {
          sessionStorage.removeItem(`resume-analysis:${analysisId}`);
        }
      }

      try {
        const response = await fetch(`/api/analysis/${analysisId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Result not found.");
        }

        const normalized = {
          analysisId: data.analysis.id,
          feedback: data.analysis.feedback,
          metadata: {
            fileName: data.analysis.fileName,
            jobTitle: data.analysis.jobTitle,
            companyName: data.analysis.companyName,
            analyzedAt: data.analysis.createdAt,
          },
        };

        if (isMounted) {
          setAnalysisData(normalized);
          sessionStorage.setItem(
            `resume-analysis:${analysisId}`,
            JSON.stringify(normalized)
          );
        }
      } catch (error) {
        if (!hasLocalData && isMounted) {
          setLoadError(
            error.message ||
              "Result not found. Please re-analyze your resume from the upload page."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAnalysis();

    return () => {
      isMounted = false;
    };
  }, [analysisId]);

  const sections = useMemo(() => {
    if (!analysisData?.feedback) return [];

    return SECTION_CONFIG.map((section) => {
      const block = analysisData.feedback?.[section.key] || {};
      const tips = Array.isArray(block.tips) ? block.tips : [];
      return {
        ...section,
        score: typeof block.score === "number" ? block.score : 0,
        tips,
      };
    });
  }, [analysisData]);

  const overallScore =
    typeof analysisData?.feedback?.overallScore === "number"
      ? analysisData.feedback.overallScore
      : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="px-4 py-10">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          <header className="rounded-2xl border border-gray-800 bg-linear-to-br from-gray-900 to-gray-800 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Resume Analysis</p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">Your Results</h1>
            <p className="mt-3 text-gray-300">
              Review what is already strong and what to improve for better interview outcomes.
            </p>

            {analysisData?.metadata ? (
              <div className="mt-5 flex flex-wrap gap-2 text-sm text-gray-300">
                <span className="rounded-full border border-gray-700 px-3 py-1">
                  {analysisData.metadata.fileName || "Resume"}
                </span>
                {analysisData.metadata.jobTitle ? (
                  <span className="rounded-full border border-gray-700 px-3 py-1">
                    Role: {analysisData.metadata.jobTitle}
                  </span>
                ) : null}
                {analysisData.metadata.companyName ? (
                  <span className="rounded-full border border-gray-700 px-3 py-1">
                    Company: {analysisData.metadata.companyName}
                  </span>
                ) : null}
              </div>
            ) : null}
          </header>

          {loadError ? (
            <section className="rounded-2xl border border-rose-600/40 bg-rose-950/30 p-6">
              <p className="text-rose-200">{loadError}</p>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/upload"
                  className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400"
                >
                  Go to Upload
                </Link>
              </div>
            </section>
          ) : null}

          {isLoading ? (
            <section className="rounded-2xl border border-gray-700 bg-gray-900/60 p-6">
              <p className="text-gray-200">Loading analysis...</p>
            </section>
          ) : null}

          {!loadError && !isLoading ? (
            <>
              <section className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Overall Score</p>
                    <p className="text-4xl font-black text-white">{overallScore}/100</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/upload")}
                    className="rounded-lg border border-purple-500 px-4 py-2 text-sm font-semibold text-purple-200 hover:bg-purple-900/20"
                  >
                    Analyze Another Resume
                  </button>
                </div>
              </section>

              <section className="grid gap-5 sm:grid-cols-2">
                {sections.map((section) => (
                  <article
                    key={section.key}
                    className="rounded-2xl border border-gray-800 bg-linear-to-br from-gray-900 to-gray-800 p-5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h2 className="text-lg font-bold text-white">{section.label}</h2>
                      <span
                        className={`rounded-full border px-3 py-1 text-sm font-semibold ${scoreTone(section.score)}`}
                      >
                        {section.score}/100
                      </span>
                    </div>

                    <div className="space-y-3">
                      {section.tips.map((tip, index) => {
                        const isGood = tip?.type === "good";
                        return (
                          <div
                            key={`${section.key}-${index}`}
                            className={`rounded-xl border p-3 ${
                              isGood
                                ? "border-emerald-600/40 bg-emerald-950/20"
                                : "border-amber-600/40 bg-amber-950/20"
                            }`}
                          >
                            <div className="mb-1 flex items-center gap-2">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                                  isGood
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : "bg-amber-500/20 text-amber-300"
                                }`}
                              >
                                {isGood ? "Good" : "Improve"}
                              </span>
                              <h3 className="text-sm font-semibold text-gray-100">
                                {tip?.tip || "Suggestion"}
                              </h3>
                            </div>
                            <p className="text-sm leading-6 text-gray-300">
                              {tip?.explanation || "No details provided."}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </section>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
