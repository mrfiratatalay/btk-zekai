export type ProductId = string;

export type ProductReview = {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  text: string;
  verifiedPurchase: boolean;
  date: string;
  helpfulCount: number;
  tags: string[];
};

export type Product = {
  id: ProductId;
  title: string;
  brand: string;
  sellerName: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  image: string;
  thumbnails: string[];
  shortDescription: string;
  description: string;
  features: Record<string, string>;
  badges: string[];
  stock: number;
  cargoText: string;
};
