namespace ZekAI.Domain.Entities;

public class ProductImage
{
    public int Id { get; set; }
    public string ProductId { get; set; } = "";
    public string Url { get; set; } = "";
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }

    public Product? Product { get; set; }
}
