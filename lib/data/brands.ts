export interface BrandData {
  id: number;
  name: string;
  description: string;
  rating: number;
  whatsapp: string;
  heylink: string;
  logo: string;
}

export const brands = [
  {
    id: 1,
    name: "7ERA Club",
    description: "Premium gaming membership platform.",
    rating: 5,
    whatsapp: "#",
    heylink: "#",
    logo: "/brands/7era.png",
  },
  {
    id: 2,
    name: "SC Club",
    description: "VIP rewards and campaign management.",
    rating: 5,
    whatsapp: "#",
    heylink: "#",
    logo: "/brands/scclub.png",
  },
  {
    id: 3,
    name: "TNG30",
    description: "Fast access to exclusive promotions.",
    rating: 5,
    whatsapp: "#",
    heylink: "#",
    logo: "/brands/tng30.png",
  },
  {
    id: 4,
    name: "ShopPay",
    description: "Integrated payment and membership.",
    rating: 5,
    whatsapp: "#",
    heylink: "#",
    logo: "/brands/shoppay.png",
  },
];