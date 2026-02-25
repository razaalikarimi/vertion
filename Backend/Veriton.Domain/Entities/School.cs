using Veriton.Domain.Common;

namespace Veriton.Domain.Entities;

public class School : BaseEntity
{
    public string SchoolCode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? LogoUrl { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? PrincipalName { get; set; }
    public DateTime? EstablishedDate { get; set; }
    public string? Website { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public ICollection<Grade> Grades { get; set; } = new List<Grade>();
    public ICollection<Teacher> Teachers { get; set; } = new List<Teacher>();
    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<Module> Modules { get; set; } = new List<Module>();
}
