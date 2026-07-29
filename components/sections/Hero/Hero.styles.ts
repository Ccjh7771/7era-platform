export const heroSectionStyles =
  "relative flex min-h-screen items-center overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black px-6 py-28 lg:py-32";

export const heroBackgroundGlowStyles =
  `
  pointer-events-none
  absolute
  inset-0

  before:absolute
  before:left-[-180px]
  before:top-[-120px]
  before:h-[480px]
  before:w-[480px]
  before:rounded-full
  before:bg-violet-600/20
  before:blur-[150px]

  after:absolute
  after:bottom-[-160px]
  after:right-[-180px]
  after:h-[520px]
  after:w-[520px]
  after:rounded-full
  after:bg-blue-500/15
  after:blur-[170px]
  `;

export const heroContentStyles =
  "relative z-10 mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20";

export const heroLeftStyles =
  "flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left";

export const heroBadgeStyles =
  `
  inline-flex
  items-center
  gap-3
  rounded-full
  border
  border-yellow-400/30
  bg-white/5
  px-5
  py-2
  text-xs
  font-semibold
  uppercase
  tracking-[0.25em]
  text-yellow-300
  shadow-[0_0_30px_rgba(250,204,21,0.08)]
  backdrop-blur-md
  `;

export const heroBadgeDotStyles =
  `
  h-2
  w-2
  shrink-0
  animate-pulse
  rounded-full
  bg-yellow-400
  shadow-[0_0_14px_rgba(250,204,21,0.85)]
  `;

export const heroTitleStyles =
  `
  mt-8
  flex
  flex-col
  text-5xl
  font-black
  leading-[1.02]
  tracking-[-0.045em]
  text-white
  drop-shadow-[0_8px_35px_rgba(255,255,255,0.08)]
  sm:text-6xl
  md:text-7xl
  xl:text-8xl
  `;

export const heroHighlightStyles =
  `
  bg-gradient-to-r
  from-yellow-100
  via-yellow-400
  to-amber-300
  bg-clip-text
  text-transparent
  drop-shadow-[0_0_28px_rgba(250,204,21,0.28)]
  `;

export const heroSubtitleStyles =
  `
  mt-3
  max-w-4xl
  text-[0.62em]
  leading-[1.08]
  tracking-[-0.035em]
  text-white
  `;

export const heroDescriptionStyles =
  `
  mt-5
  max-w-2xl
  text-base
  leading-8
  text-zinc-400
  sm:text-lg
  `;

export const heroButtonGroupStyles =
  "mt-9 flex w-full flex-col gap-4 sm:w-auto sm:flex-row";

export const heroStatsStyles =
  `
  mt-12
  grid
  w-full
  max-w-3xl
  grid-cols-2
  gap-3
  sm:gap-4
  xl:grid-cols-4
  `;

export const heroStatCardStyles =
  `
  group
  flex
  min-h-[112px]
  flex-col
  justify-center
  rounded-2xl
  border
  border-white/10
  bg-white/[0.035]
  px-4
  py-5
  text-center
  shadow-[0_15px_45px_rgba(0,0,0,0.2)]
  backdrop-blur-xl
  transition-all
  duration-300
  ease-out

  hover:-translate-y-1
  hover:border-yellow-400/25
  hover:bg-white/[0.065]
  hover:shadow-[0_20px_55px_rgba(0,0,0,0.35)]

  lg:text-left
  `;

export const heroStatValueStyles =
  `
  bg-gradient-to-r
  from-yellow-200
  via-yellow-400
  to-amber-300
  bg-clip-text
  text-2xl
  font-black
  tracking-tight
  text-transparent
  sm:text-3xl
  `;

export const heroStatLabelStyles =
  `
  mt-2
  text-xs
  font-semibold
  uppercase
  leading-5
  tracking-[0.12em]
  text-zinc-400
  transition-colors
  duration-300
  group-hover:text-zinc-200
  `;

export const heroRightStyles =
  "flex w-full items-center justify-center";

export const heroVisualCardStyles =
  `
  relative
  w-full
  max-w-[500px]
  overflow-hidden
  rounded-[32px]
  border
  border-white/10
  bg-gradient-to-b
  from-white/[0.09]
  via-white/[0.045]
  to-white/[0.025]
  p-6
  shadow-[0_30px_100px_rgba(0,0,0,0.55)]
  backdrop-blur-2xl
  transition-all
  duration-500
  ease-out

  hover:-translate-y-2
  hover:border-yellow-400/20
  hover:shadow-[0_40px_120px_rgba(0,0,0,0.65)]

  before:absolute
  before:left-1/2
  before:top-[-110px]
  before:h-[280px]
  before:w-[280px]
  before:-translate-x-1/2
  before:rounded-full
  before:bg-yellow-400/15
  before:blur-[90px]

  after:absolute
  after:bottom-[-140px]
  after:right-[-100px]
  after:h-[280px]
  after:w-[280px]
  after:rounded-full
  after:bg-violet-500/15
  after:blur-[100px]

  sm:p-7
  `;

export const heroVisualHeaderStyles =
  "relative z-10 flex flex-col items-center text-center";

export const heroVisualLogoStyles =
  `
  flex
  h-28
  w-28
  items-center
  justify-center
  rounded-3xl
  border
  border-yellow-400/20
  bg-black/30
  p-4
  shadow-[0_0_40px_rgba(250,204,21,0.12)]
  `;

export const heroVisualTitleStyles =
  "mt-5 text-2xl font-black tracking-tight text-white";

export const heroVisualDescriptionStyles =
  "mt-2 max-w-sm text-sm leading-6 text-zinc-400";

export const heroBrandGridStyles =
  "relative z-10 mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3";

export const heroBrandCardStyles =
  `
  group
  flex
  min-h-[132px]
  flex-col
  items-center
  justify-center
  rounded-2xl
  border
  border-white/10
  bg-black/25
  px-4
  py-5
  text-center
  transition-all
  duration-300
  ease-out

  hover:-translate-y-1
  hover:border-yellow-400/30
  hover:bg-white/[0.07]
  hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)]
  `;

export const heroBrandItemStyles =
  "flex h-14 w-full items-center justify-center";

export const heroBrandImageStyles =
  `
  max-h-12
  w-auto
  max-w-full
  object-contain
  transition-all
  duration-300
  group-hover:scale-110
  group-hover:drop-shadow-[0_0_14px_rgba(250,204,21,0.22)]
  `;

export const heroVisualFooterStyles =
  `
  relative
  z-10
  mt-7
  flex
  items-center
  justify-center
  gap-3
  text-center
  text-[10px]
  font-semibold
  uppercase
  tracking-[0.18em]
  text-yellow-300/80
  sm:text-xs
  sm:tracking-[0.22em]
  `;