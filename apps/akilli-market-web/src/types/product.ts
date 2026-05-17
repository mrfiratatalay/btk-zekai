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

export type ProductPricePoint = {
  day: string;
  price: number;
  marketMedian: number;
};

export type ProductReturnReason = {
  label: string;
  percent: number;
  evidence: string;
};

export type ProductAnalysisEvidence = {
  reviews: ProductReview[];
  visualNotes: {
    studioPhotoCount: number;
    customerPhotoCount: number;
    consistencyNotes: string[];
    redFlags: string[];
  };
  priceHistory: ProductPricePoint[];
  market: {
    medianPrice: number;
    fairPriceMin: number;
    fairPriceMax: number;
    alternativeSellers: Array<{ name: string; price: number; rating: number }>;
  };
  returnReasons: ProductReturnReason[];
  sellerSignals: {
    storeRating: number;
    shippingScore: number;
    responseTime: string;
    riskNotes: string[];
  };
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
  analysisEvidence?: ProductAnalysisEvidence;
};
