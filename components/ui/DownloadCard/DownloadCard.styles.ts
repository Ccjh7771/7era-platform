export const downloadCardStyles = `
  group
  relative
  h-full
  border-yellow-500/20
  bg-gradient-to-b
  from-white/[0.08]
  via-zinc-900/95
  to-black
  shadow-[0_20px_60px_rgba(0,0,0,0.35)]
`;

export const contentStyles =
  "flex h-full flex-col items-center text-center";

export const logoWrapperStyles = `
  flex
  h-28
  w-28
  items-center
  justify-center
  overflow-hidden
  rounded-3xl
  border
  border-yellow-400/20
  bg-black/45
  p-4
  transition-all
  duration-500

  group-hover:scale-105
  group-hover:border-yellow-300/40
  group-hover:shadow-[0_0_40px_rgba(250,204,21,0.18)]
`;

export const logoStyles = `
  h-full
  w-full
  object-contain
  transition-transform
  duration-500
  group-hover:scale-110
`;

export const titleStyles =
  "mt-7 text-2xl font-black tracking-tight text-white";

export const descriptionStyles =
  "mt-3 min-h-[48px] text-sm leading-6 text-zinc-400";

export const badgeRowStyles =
  "mt-5 flex flex-wrap items-center justify-center gap-2";

export const platformBadgeStyles = `
  inline-flex
  items-center
  rounded-full
  border
  border-white/10
  bg-white/[0.06]
  px-3
  py-1.5
  text-[11px]
  font-bold
  uppercase
  tracking-[0.16em]
  text-zinc-300
`;

export const latestBadgeStyles = `
  inline-flex
  items-center
  rounded-full
  border
  border-yellow-400/20
  bg-yellow-400/10
  px-3
  py-1.5
  text-[11px]
  font-bold
  uppercase
  tracking-[0.16em]
  text-yellow-300
`;

export const detailsStyles = `
  mt-7
  grid
  w-full
  gap-3
  rounded-2xl
  border
  border-white/10
  bg-black/30
  p-4
  text-left
`;

export const detailRowStyles =
  "flex items-center justify-between gap-4";

export const detailLabelStyles =
  "text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500";

export const detailValueStyles =
  "text-sm font-bold text-zinc-200";

export const actionsStyles =
  "mt-auto flex w-full flex-col gap-3 pt-8";

export const downloadLinkStyles = `
  inline-flex
  min-h-[52px]
  w-full
  items-center
  justify-center
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

export const disabledLinkStyles = `
  cursor-not-allowed
  opacity-45
  hover:translate-y-0
  hover:shadow-none
`;

export const guideLinkStyles = `
  inline-flex
  min-h-[48px]
  w-full
  items-center
  justify-center
  rounded-2xl
  border
  border-yellow-400/30
  bg-yellow-400/[0.06]
  px-5
  py-3
  text-sm
  font-bold
  text-yellow-300
  transition-all
  duration-300

  hover:-translate-y-1
  hover:border-yellow-300/60
  hover:bg-yellow-400/10

  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-yellow-400
`;