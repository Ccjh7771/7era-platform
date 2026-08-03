export const tabsWrapperStyles = `
  flex
  w-full
  items-center
  justify-center
`;

export const tabsListStyles = `
  inline-flex
  max-w-full
  items-center
  gap-2
  overflow-x-auto
  rounded-2xl
  border
  border-white/10
  bg-black/35
  p-2
  shadow-[0_15px_45px_rgba(0,0,0,0.28)]
  backdrop-blur-xl

  [scrollbar-width:none]
  [&::-webkit-scrollbar]:hidden
`;

export const tabBaseStyles = `
  inline-flex
  min-h-[44px]
  shrink-0
  items-center
  justify-center
  rounded-xl
  px-5
  py-2.5
  text-sm
  font-bold
  transition-all
  duration-300

  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-yellow-400
`;

export const activeTabStyles = `
  border
  border-yellow-300/40
  bg-gradient-to-r
  from-yellow-300
  via-yellow-400
  to-amber-300
  text-black
  shadow-[0_8px_28px_rgba(250,204,21,0.25)]
`;

export const inactiveTabStyles = `
  border
  border-transparent
  bg-transparent
  text-zinc-400

  hover:border-white/10
  hover:bg-white/[0.06]
  hover:text-white
`;

export const disabledTabStyles = `
  cursor-not-allowed
  opacity-40

  hover:border-transparent
  hover:bg-transparent
  hover:text-zinc-400
`;