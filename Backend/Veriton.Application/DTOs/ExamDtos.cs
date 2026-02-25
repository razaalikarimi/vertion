namespace Veriton.Application.DTOs;

// ========================================
// EXAM DTOs
// ========================================

public class ExamCreateDto
{
    public Guid GradeId { get; set; }
    public Guid ModuleId { get; set; }
    public DateTime Date { get; set; }
    public Guid? CreatedByTeacherId { get; set; }
    public string? Title { get; set; }
    public int? TotalMarks { get; set; }
    public int? DurationMinutes { get; set; }
}

public class ExamUpdateDto
{
    public Guid GradeId { get; set; }
    public Guid ModuleId { get; set; }
    public DateTime Date { get; set; }
    public Guid? CreatedByTeacherId { get; set; }
    public string? Title { get; set; }
    public int? TotalMarks { get; set; }
    public int? DurationMinutes { get; set; }
    public bool IsActive { get; set; }
}

public class ExamDto
{
    public Guid Id { get; set; }
    public Guid GradeId { get; set; }
    public string GradeName { get; set; } = "";
    public Guid ModuleId { get; set; }
    public string ModuleName { get; set; } = "";
    public DateTime Date { get; set; }
    public Guid CreatedByTeacherId { get; set; }
    public string CreatedByTeacherName { get; set; } = "";
    public string? Title { get; set; }
    public int? TotalMarks { get; set; }
    public int? DurationMinutes { get; set; }
    public bool IsActive { get; set; }
    public int QuestionCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
