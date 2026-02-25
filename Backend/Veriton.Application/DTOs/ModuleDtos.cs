namespace Veriton.Application.DTOs;

// ========================================
// MODULE (Subject) DTOs
// ========================================

public class ModuleCreateDto
{
    public Guid? SchoolId { get; set; }
    public Guid GradeId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int Credits { get; set; }
    public Guid? CreatedByTeacherId { get; set; }
}

public class ModuleUpdateDto
{
    public Guid? SchoolId { get; set; }
    public Guid GradeId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int Credits { get; set; }
    public Guid? CreatedByTeacherId { get; set; }
    public bool IsActive { get; set; }
}

public class ModuleDto
{
    public Guid Id { get; set; }
    public Guid SchoolId { get; set; }
    public string SchoolName { get; set; } = "";
    public Guid GradeId { get; set; }
    public string GradeName { get; set; } = "";
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int Credits { get; set; }
    public Guid? CreatedByTeacherId { get; set; }
    public string CreatedByTeacherName { get; set; } = "";
    public bool IsActive { get; set; }
    public int LessonCount { get; set; }
    public int ExamCount { get; set; }
}