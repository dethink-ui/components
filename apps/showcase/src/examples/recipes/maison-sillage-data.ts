export type SillageSize = "30" | "50" | "100";
export type SillageFamily = "Amber" | "Floral" | "Woody";
export interface SillageFragrance {
  id: string;
  name: string;
  number: string;
  family: SillageFamily;
  image: string;
  line: string;
  description: string;
  notes: [string, string, string];
  prices: Record<SillageSize, number>;
  mood: string;
}

export const fragrances: SillageFragrance[] = [
  {
    id: "ambre",
    name: "Ambre",
    number: "01",
    family: "Amber",
    image: "ambre.webp",
    line: "The warmth of a moment, kept.",
    description:
      "Golden light on bare skin. A bright opening of bergamot gives way to soft labdanum, before settling into a warm trail of amber and vanilla. Intimate, enveloping, quietly unforgettable.",
    notes: ["Bergamot · Pink pepper", "Labdanum · Iris", "Amber · Vanilla"],
    prices: { "30": 6500, "50": 11000, "100": 17000 },
    mood: "Warm / Luminous / Intimate",
  },
  {
    id: "rose",
    name: "Rose",
    number: "02",
    family: "Floral",
    image: "rose.webp",
    line: "A rose, with a little wild in it.",
    description:
      "The first light in an untamed garden. Dewy rose meets the gentle lift of blackcurrant, with a soft musk that lingers close. A familiar flower, seen in an entirely new light.",
    notes: [
      "Blackcurrant · Mandarin",
      "Rose · Peony",
      "White musk · Sandalwood",
    ],
    prices: { "30": 7000, "50": 12000, "100": 18500 },
    mood: "Floral / Fresh / Free-spirited",
  },
  {
    id: "bois",
    name: "Bois",
    number: "03",
    family: "Woody",
    image: "bois.webp",
    line: "Find your stillness in the woods.",
    description:
      "A slow walk beneath a green canopy. Crisp cardamom and fig leaf unfold into cedar, then soften into vetiver and creamy sandalwood. Grounded, textured, naturally intriguing.",
    notes: ["Cardamom · Fig leaf", "Cedar · Violet", "Vetiver · Sandalwood"],
    prices: { "30": 6800, "50": 11500, "100": 18000 },
    mood: "Woody / Green / Grounded",
  },
];

export const bottleSizes: SillageSize[] = ["30", "50", "100"];
export const money = (pence: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(pence / 100);
export interface SillageBagLine {
  productId: string;
  size: SillageSize;
  quantity: number;
}
export const bagKey = (line: Pick<SillageBagLine, "productId" | "size">) =>
  `${line.productId}-${line.size}`;
export const getFragrance = (id: string) =>
  fragrances.find((product) => product.id === id)!;
export const bagSubtotal = (lines: SillageBagLine[]) =>
  lines.reduce(
    (sum, line) =>
      sum + getFragrance(line.productId).prices[line.size] * line.quantity,
    0,
  );
export const sampleDelivery = (subtotal: number) =>
  subtotal === 0 || subtotal >= 15000 ? 0 : 500;

export const sillageReviews = [
  {
    name: "Clara M.",
    scent: "Ambre 01",
    quote:
      "Like the last golden hour of summer, bottled. It has become the part of getting ready I look forward to most.",
  },
  {
    name: "Jules R.",
    scent: "Bois 03",
    quote:
      "Quiet, warm and beautifully different. The kind of scent you wear for yourself, then everyone asks about.",
  },
  {
    name: "Amelia K.",
    scent: "Rose 02",
    quote:
      "A rose that feels alive. Fresh at first, then soft and a little unexpected. I keep coming back to it.",
  },
];

export const sillageFaq = [
  [
    "How do I choose my first fragrance?",
    "Follow the feeling. Ambre is warm and enveloping, Rose is fresh and floral, and Bois is grounded and woody. Open each fragrance to explore its top, heart and base notes.",
  ],
  [
    "What sizes are available?",
    "Each eau de parfum comes in 30 ml, 50 ml and 100 ml. Choose a size in the fragrance details to see its price before adding it to your bag.",
  ],
  [
    "Can I send a fragrance as a gift?",
    "Our sample collection is presented in a signature ivory box. This storefront is a fictional shopping demo; gift messages, delivery and fulfillment are not connected.",
  ],
  [
    "How does delivery work?",
    "The demo bag uses a £5 delivery charge, waived from £150. These are sample prices and policies. No real order, payment or shipment is created.",
  ],
];
