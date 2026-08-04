export const promotionCardStyles = `
  group
  relative
  h-full
  overflow-hidden
  border-yellow-500/20
  bg-gradient-to-b
  from-white/[0.08]
  via-zinc-900/95
  to-black
  shadow-[0_20px_60px_rgba(0,0,0,0.35)]
`;

export const featuredGlowStyles = `
  pointer-events-none
  absolute
  -right-20
  -top-20
  h-56
  w-56
  rounded-full
  bg-yellow-400/10
  blur-[80px]
`;

export const contentStyles =
  "relative z-10 flex h-full flex-col";

export const imageWrapperStyles = `
  relative
  flex
  aspect-[16/9]
  w-full
  items-center
  justify-center
  overflow-hidden
  rounded-3xl
  border
  border-white/10
  bg-gradient-to-br
  from-yellow-400/10
  via-black
  to-violet-500/10
`;

export const imageStyles = `
  h-full
  w-full
  object-cover
  transition-transform
  duration-500
  group-hover:scale-105
`;

export const imagePlaceholderStyles = `
  flex
  h-full
  w-full
  items-center
  justify-center
  text-5xl
  font-black
  text-yellow-300
`;

export const badgeRowStyles =
  "mt-6 flex flex-wrap items-center gap-2";

export const categoryBadgeStyles = `
  inline-flex
  items-center
  rounded-full
  border
  border-yellow-400/25
  bg-yellow-400/10
  px-3
  py-1.5
  text-[11px]
  font-bold
  uppercase
  tracking-[0.16em]
  text-yellow-300
`;

export const featuredBadgeStyles = `
  inline-flex
  items-center
  rounded-full
  border
  border-violet-400/25
  bg-violet-400/10
  px-3
  py-1.5
  text-[11px]
  font-bold
  uppercase
  tracking-[0.16em]
  text-violet-300
`;

export const activeStatusStyles = `
  border-green-400/25
  bg-green-400/10
  text-green-300
`;

export const upcomingStatusStyles = `
  border-blue-400/25
  bg-blue-400/10
  text-blue-300
`;

export const endedStatusStyles = `
  border-white/10
  bg-white/[0.05]
  text-zinc-500
`;

export const statusBadgeBaseStyles = `
  inline-flex
  items-center
  rounded-full
  border
  px-3
  py-1.5
  text-[11px]
  font-bold
  uppercase
  tracking-[0.16em]
`;

export const titleStyles =
  "mt-6 text-2xl font-black tracking-tight text-white";

export const subtitleStyles =
  "mt-2 text-base font-bold text-yellow-300";

export const descriptionStyles =
  "mt-4 text-sm leading-7 text-zinc-400";

export const validityStyles = `
  mt-6
  flex
  items-center
  justify-between
  gap-4
  rounded-2xl
  border
  border-white/10
  bg-black/30
  px-4
  py-3
`;

export const validityLabelStyles =
  "text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500";

export const validityValueStyles =
  "text-right text-sm font-bold text-zinc-200";

export const actionsStyles =
  "mt-auto pt-7";

export const actionLinkStyles = `
  inline-flex
  min-h-[52px]
  w-full
  items-center
  justify-between
  rounded-2xl
  bg-gradient-to-r
  from-yellow-300
  via-yellow-400
  to-amber-300
  px-5
  py-3
  text-sm
  font-black
  text-black
  transition-all
  duration-300

  hover:-translate-y-1
  hover:shadow-[0_12px_35px_rgba(250,204,21,0.32)]

  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-yellow-400
`;

export const disabledActionStyles = `
  cursor-not-allowed
  opacity-45
  hover:translate-y-0
  hover:shadow-none
`;

export const arrowStyles =
  "text-lg transition-transform duration-300 group-hover:translate-x-1";