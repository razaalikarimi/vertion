namespace Veriton.Application.DTOs;

public class SchoolCreateDto
{
    public string SchoolCode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? LogoUrl { get; set; }
    public string? Address { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
}

public class SchoolUpdateDto : SchoolCreateDto
{
    public bool IsActive { get; set; }
}

public class SchoolDto
{
    public Guid Id { get; set; }
    public string SchoolCode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Address { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? LogoUrl { get; set; }
    public bool IsActive { get; set; }
}
