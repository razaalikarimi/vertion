namespace Veriton.Application.DTOs;

public class StudentCreateDto
{
    public Guid? SchoolId { get; set; }
    public Guid GradeId { get; set; }
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
}

public class StudentUpdateDto : StudentCreateDto
{
    public bool IsActive { get; set; }
}

public class StudentDto
{
    public Guid Id { get; set; }
    public Guid SchoolId { get; set; }
    public string SchoolName { get; set; } = null!;
    public Guid GradeId { get; set; }
    public string GradeName { get; set; } = null!;
    public string StudentId { get; set; } = null!;
    public string? RollNo { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? ParentGuardianName { get; set; }
    public string? ParentGuardianPhone { get; set; }
    public bool IsActive { get; set; }
    public double ProgressPercentage { get; set; }
}