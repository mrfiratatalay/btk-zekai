namespace ZekAI.Domain.Enums;

public enum UserRole { Buyer, Seller }

public enum ProductStatus { Urgent, Watch, Healthy }

public enum StorePlatform { DemoStore, Trendyol, Hepsiburada, Shopify, WooCommerce }

public enum StoreConnectionStatus { Connected, NotConnected, ComingSoon }

public enum OrderStatus { Pending, Delivered, ReturnRequested, Completed }

public enum ReturnStatus { SellerReview, SellerDisputed, ArbiterReview, ResolutionProposed, Resolved }

public enum ReturnReasonKey { Damaged, NotAsExpected, WrongProduct, LowQuality, Other }
