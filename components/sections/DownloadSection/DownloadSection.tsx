"use client";

import { useMemo, useState } from "react";

import { DownloadCard } from "@/components/ui/DownloadCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tabs } from "@/components/ui/Tabs";
import {
  downloads,
  downloadPlatforms,
} from "@/lib/data/downloads";

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

export function DownloadSection() {
  const [activePlatform, setActivePlatform] = useState("all");

  const visibleDownloads = useMemo(() => {
    if (activePlatform === "all") {
      return downloads;
    }

    return downloads.filter(
      (download) => download.platform === activePlatform,
    );
  }, [activePlatform]);

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
      </div>
    </section>
  );
}
