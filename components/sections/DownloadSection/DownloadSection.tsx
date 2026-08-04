"use client";

import { useMemo, useState } from "react";

import { DownloadCard } from "@/components/ui/DownloadCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tabs } from "@/components/ui/Tabs";
import {
  downloadPlatforms,
} from "@/lib/data/downloads";
import type { DownloadItem } from "@/lib/data/downloads";

import {
  backgroundGlowStyles,
  containerStyles,
  faqBadgeStyles,
  faqDescriptionStyles,
  faqHeaderStyles,
  faqListStyles,
  faqPanelStyles,
  faqSectionStyles,
  faqTitleStyles,
  gridStyles,
  guideBadgeStyles,
  guideDescriptionStyles,
  guideHeaderStyles,
  guidePanelStyles,
  guideSectionStyles,
  guideTitleStyles,
  noticeStyles,
  sectionStyles,
  stepCardStyles,
  stepDescriptionStyles,
  stepNumberStyles,
  stepsGridStyles,
  stepTitleStyles,
} from "./DownloadSection.styles";

import type { InstallationStep } from "./DownloadSection.types";

const installationSteps: InstallationStep[] = [
  {
    number: "01",
    title: "Download",
    description:
      "Select your preferred application and press the official download button.",
  },
  {
    number: "02",
    title: "Allow Installation",
    description:
      "If requested, allow installation from your browser or trusted source.",
  },
  {
    number: "03",
    title: "Install Application",
    description:
      "Open the downloaded file and follow the instructions shown on your device.",
  },
  {
    number: "04",
    title: "Launch",
    description:
      "Open the application after installation and continue with the required setup.",
  },
];


const faqItems = [
  {
    question: "Are these official download links?",
    answer:
      "Yes. All active download buttons on this page connect to official or verified 7ERA Platform download sources.",
  },
  {
    question: "Why is a download button unavailable?",
    answer:
      "The application may be undergoing maintenance or its latest version may not be ready for your selected platform.",
  },
  {
    question: "Can I install the application on any device?",
    answer:
      "Availability depends on the application and your device platform. Use the platform tabs above to view compatible downloads.",
  },
  {
    question: "What should I do if installation is blocked?",
    answer:
      "Check your device security settings and confirm that you downloaded the application using an official link from this page.",
  },
];


export function DownloadSection({
  downloads,
}: {
  downloads: DownloadItem[];
}) {
    
  const [activePlatform, setActivePlatform] = useState("all");

  const visibleDownloads = useMemo(() => {
    if (activePlatform === "all") {
      return downloads;
    }

    return downloads.filter(
      (download) => download.platform === activePlatform,
    );
  }, [activePlatform, downloads]);

  return (
    <section
      id="downloads"
      className={sectionStyles}
    >
      <div
        className={backgroundGlowStyles}
        aria-hidden="true"
      />

      <div className={containerStyles}>
        <Reveal>
          <SectionHeader
            badge="OFFICIAL DOWNLOADS"
            title="Download Center"
            description="Access the latest official applications, version information and installation guidance from one convenient location."
          />
        </Reveal>

        <Reveal delay={100}>
          <Tabs
            items={downloadPlatforms}
            value={activePlatform}
            onValueChange={setActivePlatform}
            ariaLabel="Filter downloads by platform"
            className="mt-12"
          />
        </Reveal>

        {visibleDownloads.length > 0 ? (
          <div className={gridStyles}>
            {visibleDownloads.map((download, index) => (
              <Reveal
                key={download.id}
                delay={index * 80}
                className="h-full"
              >
                <DownloadCard
                  title={download.title}
                  description={download.description}
                  logo={download.logo}
                  platform={download.platform}
                  version={download.version}
                  updatedAt={download.updatedAt}
                  size={download.size}
                  downloadUrl={download.downloadUrl}
                  guideUrl={download.guideUrl}
                  isLatest={download.isLatest}
                  disabled={download.disabled}
                  className="h-full"
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="mt-16 rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-16 text-center backdrop-blur-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 text-2xl text-yellow-300">
                ↓
              </div>

              <h2 className="mt-6 text-2xl font-black text-white">
                No downloads available
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-400">
                Downloads for this platform are not available yet. Please check
                again later.
              </p>
            </div>
          </Reveal>
        )}

        <div
          id="installation-guide"
          className={guideSectionStyles}
        >
          <Reveal distance={32}>
            <div className={guidePanelStyles}>
              <div className={guideHeaderStyles}>
                <span className={guideBadgeStyles}>
                  Installation Guide
                </span>

                <h2 className={guideTitleStyles}>
                  Get started in four steps
                </h2>

                <p className={guideDescriptionStyles}>
                  Follow these general instructions to download and install an
                  application safely on your device.
                </p>
              </div>

              <div className={stepsGridStyles}>
                {installationSteps.map((step, index) => (
                  <Reveal
                    key={step.number}
                    delay={index * 80}
                    className="h-full"
                  >
                    <article className={stepCardStyles}>
                      <span className={stepNumberStyles}>
                        {step.number}
                      </span>

                      <h3 className={stepTitleStyles}>
                        {step.title}
                      </h3>

                      <p className={stepDescriptionStyles}>
                        {step.description}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </div>

              <p className={noticeStyles}>
                Download applications only from links provided by 7ERA Platform
                or its verified official channels.
              </p>
            </div>
          </Reveal>
                </div>

        <div
          id="download-faq"
          className={faqSectionStyles}
        >
          <Reveal distance={32}>
            <div className={faqPanelStyles}>
              <div className={faqHeaderStyles}>
                <span className={faqBadgeStyles}>
                  Download FAQ
                </span>

                <h2 className={faqTitleStyles}>
                  Frequently asked questions
                </h2>

                <p className={faqDescriptionStyles}>
                  Find answers to common questions about downloads,
                  compatibility and installation.
                </p>
              </div>

              <div className={faqListStyles}>
                {faqItems.map((item, index) => (
                  <Reveal
                    key={item.question}
                    delay={index * 70}
                  >
                    <details className="group overflow-hidden rounded-2xl border border-white/10 bg-black/25 transition duration-300 open:border-yellow-400/25 open:bg-yellow-400/[0.04]">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-5 text-left text-base font-bold text-white sm:px-6">
                        <span>{item.question}</span>

                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-yellow-400/20 bg-yellow-400/10 text-lg text-yellow-300 transition-transform duration-300 group-open:rotate-45"
                          aria-hidden="true"
                        >
                          +
                        </span>
                      </summary>

                      <div className="border-t border-white/10 px-5 py-5 sm:px-6">
                        <p className="max-w-3xl text-sm leading-7 text-zinc-400">
                          {item.answer}
                        </p>
                      </div>
                    </details>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
