export const sectionStyles = `
  relative
  overflow-hidden
  px-6
  py-28
`;

export const backgroundGlowStyles = `
  pointer-events-none
  absolute
  left-1/2
  top-1/2
  h-[520px]
  w-[720px]
  -translate-x-1/2
  -translate-y-1/2
  rounded-full
  bg-yellow-400/[0.06]
  blur-[140px]
`;

export const containerStyles = `
  relative
  z-10
  mx-auto
  max-w-7xl
`;

export const panelStyles = `
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

  before:absolute
  before:left-[-100px]
  before:top-[-100px]
  before:h-[280px]
  before:w-[280px]
  before:rounded-full
  before:bg-violet-500/10
  before:blur-[90px]

  after:absolute
  after:bottom-[-120px]
  after:right-[-100px]
  after:h-[320px]
  after:w-[320px]
  after:rounded-full
  after:bg-blue-500/10
  after:blur-[100px]

  sm:px-10
  sm:py-14
  lg:px-16
  lg:py-16
`;

export const contentStyles = `
  relative
  z-10
  grid
  items-center
  gap-12
  lg:grid-cols-[1.1fr_0.9fr]
  lg:gap-16
`;

export const leftStyles =
  "flex flex-col items-center text-center lg:items-start lg:text-left";

export const featureListStyles = `
  mt-8
  grid
  w-full
  gap-4
  sm:grid-cols-3
`;

export const featureCardStyles = `
  flex
  flex-col
  items-center
  rounded-2xl
  border
  border-white/10
  bg-black/25
  px-4
  py-5
  text-center
  transition-all
  duration-300

  hover:-translate-y-1
  hover:border-yellow-400/25
  hover:bg-white/[0.06]

  lg:items-start
  lg:text-left
`;

export const featureValueStyles =
  "text-lg font-black text-yellow-300";

export const featureLabelStyles = `
  mt-1
  text-xs
  font-semibold
  uppercase
  tracking-[0.13em]
  text-zinc-500
`;

export const rightStyles =
  "flex w-full items-center justify-center";

export const supportCardStyles = `
  w-full
  max-w-md
  rounded-[28px]
  border
  border-white/10
  bg-black/35
  p-6
  shadow-[0_25px_70px_rgba(0,0,0,0.4)]
  backdrop-blur-xl
  sm:p-8
`;

export const supportTitleStyles =
  "text-2xl font-black tracking-tight text-white";

export const supportDescriptionStyles =
  "mt-3 text-sm leading-7 text-zinc-400";

export const actionListStyles =
  "mt-8 flex flex-col gap-4";

export const primaryLinkStyles = `
  inline-flex
  min-h-[52px]
  w-full
  items-center
  justify-between
  rounded-2xl
  bg-green-600
  px-5
  py-4
  text-sm
  font-bold
  text-white
  transition-all
  duration-300

  hover:-translate-y-1
  hover:bg-green-500
  hover:shadow-[0_14px_35px_rgba(34,197,94,0.35)]

  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-green-400
`;

export const secondaryLinkStyles = `
  inline-flex
  min-h-[52px]
  w-full
  items-center
  justify-between
  rounded-2xl
  border
  border-yellow-400/30
  bg-yellow-400/10
  px-5
  py-4
  text-sm
  font-bold
  text-yellow-300
  transition-all
  duration-300

  hover:-translate-y-1
  hover:border-yellow-300/60
  hover:bg-yellow-400/20
  hover:shadow-[0_14px_35px_rgba(250,204,21,0.22)]

  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-yellow-400
`;

export const arrowStyles =
  "text-lg transition-transform duration-300 group-hover:translate-x-1";