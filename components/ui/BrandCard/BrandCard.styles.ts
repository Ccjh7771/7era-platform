export const brandCardStyles =
  `
  group
  relative
  h-full
  overflow-hidden
  rounded-[28px]
  border
  border-white/10
  bg-gradient-to-b
  from-white/[0.08]
  via-zinc-900/95
  to-black
  shadow-[0_20px_60px_rgba(0,0,0,0.35)]
  backdrop-blur-xl
  transition-all
  duration-500
  ease-out

  hover:-translate-y-2
  hover:scale-[1.02]
  hover:border-yellow-400/30
  hover:shadow-[0_30px_80px_rgba(0,0,0,0.5)]
  `;

export const brandContentStyles =
  "flex h-full flex-col items-center text-center";

export const logoWrapperStyles =
  `
  relative
  flex
  h-40
  w-full
  items-center
  justify-center
  rounded-3xl
  border
  border-yellow-400/20
  bg-black/40
  p-5
  shadow-[0_0_35px_rgba(250,204,21,0.08)]
  transition-all
  duration-500

  group-hover:scale-110
  group-hover:border-yellow-300/40
  group-hover:shadow-[0_0_45px_rgba(250,204,21,0.18)]
  `;

export const logoStyles =
  `
  h-full
  w-full
  max-w-[360px]
  object-contain
  transition-transform
  duration-500
  group-hover:scale-110
  `;

export const brandNameStyles =
  `
  mt-7
  text-2xl
  font-bold
  tracking-tight
  text-white
  `;

export const descriptionStyles =
  `
  mt-4
  min-h-[72px]
  text-sm
  leading-7
  text-zinc-400
  `;

export const ratingWrapperStyles =
  `
  mt-6
  flex
  items-center
  gap-2
  rounded-full
  border
  border-yellow-400/10
  bg-yellow-400/5
  px-4
  py-2
  `;

export const starsStyles =
  `
  text-base
  tracking-[0.2em]
  text-yellow-400
  `;

export const ratingStyles =
  `
  text-sm
  font-semibold
  text-yellow-200
  `;

export const actionsStyles =
  `
  mt-auto
  grid
  w-full
  grid-cols-1
  gap-3
  pt-8
  sm:grid-cols-2
  `;

export const whatsappLinkStyles =
  `
  inline-flex
  min-h-11
  items-center
  justify-center
  rounded-2xl
  bg-green-600
  px-5
  py-3
  text-sm
  font-semibold
  text-white
  transition-all
  duration-300

  hover:-translate-y-1
  hover:bg-green-500
  hover:shadow-[0_10px_25px_rgba(34,197,94,0.35)]

  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-green-400
  `;

export const heylinkStyles =
  `
  inline-flex
  min-h-11
  items-center
  justify-center
  rounded-2xl
  border
  border-yellow-400/30
  bg-yellow-400/10
  px-5
  py-3
  text-sm
  font-semibold
  text-yellow-300
  transition-all
  duration-300

  hover:-translate-y-1
  hover:border-yellow-300/60
  hover:bg-yellow-400/20
  hover:shadow-[0_10px_25px_rgba(250,204,21,0.25)]

  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-yellow-400
  `;
