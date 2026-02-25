using Veriton.Domain.Common;

namespace Veriton.Domain.Entities;

public class Student : BaseEntity
{
    public Guid SchoolId { get; set; }
    public Guid GradeId { get; set; }
    public Guid? UserId { get; set; }
    public string StudentId { get; set; } = null!;
    public string? RollNo { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? BloodGroup { get; set; }
    public string? Address { get; set; }
    public DateTime? AdmissionDate { get; set; }
    public string? ParentGuardianName { get; set; }
    public string? ParentGuardianPhone { get; set; }
    public string? ParentGuardianEmail { get; set; }
    public string? EmergencyContact { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public School School { get; set; } = null!;
    public Grade Grade { get; set; } = null!;
    public User? User { get; set; }
}
