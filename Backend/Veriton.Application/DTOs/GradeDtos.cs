namespace Veriton.Application.DTOs;

public class GradeCreateDto
{
    public Guid SchoolId { get; set; }
    public string GradeLevel { get; set; } = null!;
    public string Section { get; set; } = null!;
    public string? GradeName { get; set; }
    public int? Capacity { get; set; }
    public Guid? ClassTeacherId { get; set; }
    public string? ClassRoom { get; set; }
    public string? AcademicYear { get; set; }
}

public class GradeUpdateDto : GradeCreateDto
{
    public bool IsActive { get; set; }
}

public class GradeDto
{
    public Guid Id { get; set; }
    public Guid SchoolId { get; set; }
    public string SchoolName { get; set; } = null!;
    public string GradeLevel { get; set; } = null!;
    public string Section { get; set; } = null!;
    public string GradeName { get; set; } = null!;
    public int Capacity { get; set; }
    public Guid? ClassTeacherId { get; set; }
    public string? ClassTeacherName { get; set; }
    public string? ClassRoom { get; set; }
    public string? AcademicYear { get; set; }
    public bool IsActive { get; set; }
    public int StudentCount { get; set; }
}