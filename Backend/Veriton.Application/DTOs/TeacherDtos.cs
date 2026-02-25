namespace Veriton.Application.DTOs;

public class TeacherCreateDto
{
    public Guid? SchoolId { get; set; }
    public string EmployeeId { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public DateTime? JoiningDate { get; set; }
    public string? Qualification { get; set; }
    public string? Specialization { get; set; }
    public decimal? Salary { get; set; }
}

public class TeacherUpdateDto : TeacherCreateDto
{
    public bool IsActive { get; set; }
}

public class TeacherDto
{
    public Guid Id { get; set; }
    public Guid SchoolId { get; set; }
    public string SchoolName { get; set; } = null!;
    public string EmployeeId { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Gender { get; set; }
    public string? Qualification { get; set; }
    public string? Specialization { get; set; }
    public bool IsActive { get; set; }
}