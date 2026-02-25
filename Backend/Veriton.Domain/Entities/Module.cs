using Veriton.Domain.Common;

namespace Veriton.Domain.Entities;

/// <summary>
/// Represents a Subject/Module within a Grade, created by a Teacher.
/// Replaces the old Course-based Module hierarchy.
/// </summary>
public class Module : BaseEntity, IMultiTenant
{
    public Guid SchoolId { get; set; }
    public Guid GradeId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int Credits { get; set; }
    public Guid? CreatedByTeacherId { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public School School { get; set; } = null!;
    public Grade Grade { get; set; } = null!;
    public Teacher? CreatedByTeacher { get; set; }
    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
    public ICollection<Scheduler> Schedules { get; set; } = new List<Scheduler>();
    public ICollection<Exam> Exams { get; set; } = new List<Exam>();
}
