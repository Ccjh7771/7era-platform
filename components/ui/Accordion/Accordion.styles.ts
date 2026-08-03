export const accordionStyles =
  "flex w-full flex-col gap-4";

export const itemStyles = `
  overflow-hidden
  rounded-2xl
  border
  border-white/10
  bg-black/30
  transition-all
  duration-300

  hover:border-yellow-400/25
`;

export const triggerStyles = `
  flex
  min-h-[64px]
  w-full
  items-center
  justify-between
  gap-5
  px-5
  py-4
  text-left
  text-sm
  font-bold
  text-white
  transition-colors
  duration-300

  hover:text-yellow-300

  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-inset
  focus-visible:ring-yellow-400
`;

export const iconStyles =
  "shrink-0 text-xl text-yellow-300 transition-transform duration-300";

export const contentWrapperStyles =
  "grid transition-[grid-template-rows] duration-300 ease-out";

export const contentInnerStyles =
  "overflow-hidden";

export const answerStyles =
  "border-t border-white/10 px-5 py-5 text-sm leading-7 text-zinc-400";