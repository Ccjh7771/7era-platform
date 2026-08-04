export const sectionStyles = `
  relative
  overflow-hidden
  bg-gradient-to-b
  from-black
  via-zinc-950
  to-black
  px-6
  pb-24
  pt-36
  lg:pb-32
  lg:pt-44
`;

export const backgroundGlowStyles = `
  pointer-events-none
  absolute
  left-1/2
  top-40
  h-[560px]
  w-[820px]
  -translate-x-1/2
  rounded-full
  bg-yellow-400/[0.06]
  blur-[160px]
`;

export const purpleGlowStyles = `
  pointer-events-none
  absolute
  right-[-180px]
  top-[520px]
  h-[420px]
  w-[420px]
  rounded-full
  bg-violet-500/[0.06]
  blur-[140px]
`;

export const containerStyles = `
  relative
  z-10
  mx-auto
  max-w-7xl
`;

export const gridStyles = `
  mt-16
  grid
  items-stretch
  gap-8
  md:grid-cols-2
  xl:grid-cols-3
`;

export const benefitsSectionStyles = `
  mt-28
`;

export const benefitsPanelStyles = `
  relative
  overflow-hidden
  rounded-[32px]
  border
  border-white/10
  bg-gradient-to-br
  from-white/[0.08]
  via-zinc-900/90
  to-black
  px-6
  py-12
  shadow-[0_30px_100px_rgba(0,0,0,0.45)]
  backdrop-blur-2xl

  sm:px-10
  sm:py-14
  lg:px-14
  lg:py-16
`;

export const benefitsHeaderStyles = `
  mx-auto
  max-w-3xl
  text-center
`;

export const benefitsBadgeStyles = `
  inline-flex
  rounded-full
  border
  border-yellow-400/25
  bg-yellow-400/10
  px-4
  py-2
  text-xs
  font-bold
  uppercase
  tracking-[0.22em]
  text-yellow-300
`;

export const benefitsTitleStyles = `
  mt-5
  text-3xl
  font-black
  tracking-tight
  text-white
  sm:text-4xl
`;

export const benefitsDescriptionStyles = `
  mt-4
  text-sm
  leading-7
  text-zinc-400
  sm:text-base
`;

export const benefitsGridStyles = `
  mt-12
  grid
  gap-5
  sm:grid-cols-2
  lg:grid-cols-4
`;

export const benefitCardStyles = `
  rounded-2xl
  border
  border-white/10
  bg-black/30
  px-5
  py-6
  text-center
  transition-all
  duration-300

  hover:-translate-y-1
  hover:border-yellow-400/30
  hover:bg-white/[0.06]
`;

export const benefitValueStyles = `
  text-xl
  font-black
  text-yellow-300
`;

export const benefitLabelStyles = `
  mt-2
  text-xs
  font-semibold
  uppercase
  tracking-[0.14em]
  text-zinc-500
`;

export const termsStyles = `
  mt-8
  rounded-2xl
  border
  border-white/10
  bg-black/25
  px-5
  py-4
  text-center
  text-xs
  leading-6
  text-zinc-500
`;
export const faqSectionStyles = `
  mt-28
`;

export const faqPanelStyles = `
  rounded-[32px]
  border
  border-white/10
  bg-gradient-to-br
  from-white/[0.07]
  via-zinc-900/85
  to-black
  px-6
  py-10
  shadow-[0_30px_90px_rgba(0,0,0,0.4)]
  backdrop-blur-2xl

  sm:px-10
  sm:py-12
  lg:px-14
  lg:py-14
`;

export const faqHeaderStyles =
  "mx-auto max-w-3xl text-center";

export const faqBadgeStyles = `
  inline-flex
  rounded-full
  border
  border-yellow-400/25
  bg-yellow-400/10
  px-4
  py-2
  text-xs
  font-bold
  uppercase
  tracking-[0.22em]
  text-yellow-300
`;

export const faqTitleStyles =
  "mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl";

export const faqDescriptionStyles =
  "mt-4 text-sm leading-7 text-zinc-400 sm:text-base";

export const faqListStyles =
  "mx-auto mt-10 max-w-4xl";

export const ctaSectionStyles = `
  mt-28
`;

export const ctaPanelStyles = `
  relative
  overflow-hidden
  rounded-[32px]
  border
  border-yellow-400/20
  bg-gradient-to-r
  from-yellow-400/10
  via-zinc-900/90
  to-violet-500/10
  px-6
  py-12
  text-center
  shadow-[0_30px_100px_rgba(0,0,0,0.45)]

  sm:px-10
  sm:py-14
`;

export const ctaTitleStyles =
  "text-3xl font-black tracking-tight text-white sm:text-4xl";

export const ctaDescriptionStyles =
  "mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base";

export const ctaLinkStyles = `
  mt-8
  inline-flex
  min-h-[52px]
  items-center
  justify-center
  rounded-2xl
  bg-gradient-to-r
  from-yellow-300
  via-yellow-400
  to-amber-300
  px-7
  py-3
  text-sm
  font-black
  text-black
  transition-all
  duration-300

  hover:-translate-y-1
  hover:shadow-[0_14px_40px_rgba(250,204,21,0.32)]

  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-yellow-400
`;