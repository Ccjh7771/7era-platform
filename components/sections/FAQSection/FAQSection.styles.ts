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
  top-[620px]
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

export const controlsStyles = `
  mx-auto
  mt-12
  max-w-4xl
`;

export const searchWrapperStyles = `
  relative
`;

export const searchIconStyles = `
  pointer-events-none
  absolute
  left-5
  top-1/2
  -translate-y-1/2
  text-lg
  text-zinc-500
`;

export const searchInputStyles = `
  min-h-[58px]
  w-full
  rounded-2xl
  border
  border-white/10
  bg-black/40
  py-4
  pl-14
  pr-5
  text-sm
  text-white
  shadow-[0_15px_45px_rgba(0,0,0,0.25)]
  outline-none
  backdrop-blur-xl
  transition-all
  duration-300

  placeholder:text-zinc-600

  hover:border-white/20

  focus:border-yellow-400/40
  focus:ring-2
  focus:ring-yellow-400/20
`;

export const tabsStyles = `
  mt-6
`;

export const resultsSummaryStyles = `
  mt-8
  text-center
  text-sm
  text-zinc-500
`;

export const faqPanelStyles = `
  mx-auto
  mt-12
  max-w-4xl
  rounded-[32px]
  border
  border-white/10
  bg-gradient-to-br
  from-white/[0.07]
  via-zinc-900/85
  to-black
  px-6
  py-8
  shadow-[0_30px_90px_rgba(0,0,0,0.4)]
  backdrop-blur-2xl

  sm:px-8
  sm:py-10
`;

export const emptyStateStyles = `
  mx-auto
  mt-12
  max-w-4xl
  rounded-[32px]
  border
  border-white/10
  bg-white/[0.04]
  px-6
  py-16
  text-center
  backdrop-blur-xl
`;

export const emptyIconStyles = `
  mx-auto
  flex
  h-16
  w-16
  items-center
  justify-center
  rounded-2xl
  border
  border-yellow-400/20
  bg-yellow-400/10
  text-2xl
  text-yellow-300
`;

export const emptyTitleStyles = `
  mt-6
  text-2xl
  font-black
  text-white
`;

export const emptyDescriptionStyles = `
  mx-auto
  mt-3
  max-w-lg
  text-sm
  leading-7
  text-zinc-400
`;

export const clearButtonStyles = `
  mt-6
  inline-flex
  min-h-[46px]
  items-center
  justify-center
  rounded-xl
  border
  border-yellow-400/30
  bg-yellow-400/10
  px-5
  py-2.5
  text-sm
  font-bold
  text-yellow-300
  transition-all
  duration-300

  hover:-translate-y-0.5
  hover:border-yellow-300/50
  hover:bg-yellow-400/20

  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-yellow-400
`;

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

export const ctaTitleStyles = `
  text-3xl
  font-black
  tracking-tight
  text-white
  sm:text-4xl
`;

export const ctaDescriptionStyles = `
  mx-auto
  mt-4
  max-w-2xl
  text-sm
  leading-7
  text-zinc-400
  sm:text-base
`;

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