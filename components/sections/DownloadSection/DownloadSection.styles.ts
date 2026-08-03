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
  h-[520px]
  w-[760px]
  -translate-x-1/2
  rounded-full
  bg-yellow-400/[0.06]
  blur-[150px]
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

export const guideSectionStyles = `
  mt-28
  scroll-mt-28
`;

export const guidePanelStyles = `
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
  py-10
  shadow-[0_30px_90px_rgba(0,0,0,0.4)]
  backdrop-blur-2xl

  sm:px-10
  sm:py-12
  lg:px-14
  lg:py-14
`;

export const guideHeaderStyles = `
  flex
  flex-col
  items-center
  text-center
`;

export const guideBadgeStyles = `
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

export const guideTitleStyles = `
  mt-5
  text-3xl
  font-black
  tracking-tight
  text-white
  sm:text-4xl
`;

export const guideDescriptionStyles = `
  mt-4
  max-w-2xl
  text-sm
  leading-7
  text-zinc-400
  sm:text-base
`;

export const stepsGridStyles = `
  mt-12
  grid
  gap-5
  md:grid-cols-2
  xl:grid-cols-4
`;

export const stepCardStyles = `
  group
  rounded-2xl
  border
  border-white/10
  bg-black/30
  p-6
  transition-all
  duration-300

  hover:-translate-y-1
  hover:border-yellow-400/30
  hover:bg-white/[0.06]
`;

export const stepNumberStyles = `
  flex
  h-11
  w-11
  items-center
  justify-center
  rounded-2xl
  border
  border-yellow-400/25
  bg-yellow-400/10
  text-sm
  font-black
  text-yellow-300
  transition-all
  duration-300

  group-hover:border-yellow-300/50
  group-hover:shadow-[0_0_24px_rgba(250,204,21,0.14)]
`;

export const stepTitleStyles =
  "mt-5 text-lg font-bold text-white";

export const stepDescriptionStyles =
  "mt-2 text-sm leading-6 text-zinc-400";

export const noticeStyles = `
  mt-8
  rounded-2xl
  border
  border-yellow-400/20
  bg-yellow-400/[0.06]
  px-5
  py-4
  text-center
  text-sm
  leading-6
  text-yellow-100/80
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