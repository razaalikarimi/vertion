using Veriton.Domain.Common;

namespace Veriton.Domain.Entities;

/// <summary>
/// Represents an Exam within a Grade+Module, created by a Teacher.
/// </summary>
public class Exam : BaseEntity, IMultiTenant
{
    public Guid SchoolId { get; set; }
    public Guid GradeId { get; set; }
    public Guid ModuleId { get; set; }
    public DateTime Date { get; set; }
    public Guid CreatedByTeacherId { get; set; }
    public string? Title { get; set; }
    public int? TotalMarks { get; set; }
    public int? DurationMinutes { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public Grade Grade { get; set; } = null!;
    public Module Module { get; set; } = null!;
    public Teacher CreatedByTeacher { get; set; } = null!;
    public ICollection<Question> Questions { get; set; } = new List<Question>();
}
