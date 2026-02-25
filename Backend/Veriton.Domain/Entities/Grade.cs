using Veriton.Domain.Common;

namespace Veriton.Domain.Entities;

public class Grade : BaseEntity, IMultiTenant
{
    public Guid SchoolId { get; set; }
    public string GradeLevel { get; set; } = null!; // "1", "2", ... "10"
    public string Section { get; set; } = null!; // "A", "B", "C"
    public string GradeName { get; set; } = null!; // "Grade 1 - A"
    public int Capacity { get; set; }
    public Guid? ClassTeacherId { get; set; }
    public string? ClassRoom { get; set; }
    public string? AcademicYear { get; set; } // "2024-2025"
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public School School { get; set; } = null!;
    public Teacher? ClassTeacher { get; set; }
    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<Module> Modules { get; set; } = new List<Module>();
    public ICollection<Scheduler> Schedules { get; set; } = new List<Scheduler>();
    public ICollection<Exam> Exams { get; set; } = new List<Exam>();
}
