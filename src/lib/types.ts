export type ProductCategory =
  | "visage-peau"
  | "corps-hygiene"
  | "cheveux"
  | "bebe-maternite"
  | "complements"
  | "bien-etre"
  | "dispositifs"
  | "bio-naturel";

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  shortDescription: string;
  description: string;
  benefits: string[];
  usage: string;
  precautions: string;
  ingredients: string;
  complianceNote: string;
  need?: string;
  wilayas?: string[];
  skinType?: string[];
  ageGroup?: string;
  format?: string;
  images?: string[];
  // Nouveaux champs fiche enrichie
  sku?: string;
  isBio?: boolean;
  isVegan?: boolean;
  isSansParfum?: boolean;
  isSansParabene?: boolean;
  isCertifie?: boolean;
  gender?: string;
  subcategory?: string;
  targetAudience?: string;
  usageWhen?: string;
  usageFrequency?: string;
  usageQuantity?: string;
  usageDuration?: string;
  activeIngredients?: string[];
  allergens?: string[];
  conservationConditions?: string;
  regulatoryCategory?: string;
  supplierCertified?: boolean;
}

export interface Wilaya {
  code: string;
  name: string;
  deliveryDays: string;
  homeDelivery: boolean;
  relayAvailable: boolean;
}

export interface ProductQA {
  id: string;
  productId: string;
  question: string;
  answer: string;
  askedBy?: string;
  answeredAt: string;
}
