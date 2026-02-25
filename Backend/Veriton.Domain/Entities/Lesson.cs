using Veriton.Domain.Common;

namespace Veriton.Domain.Entities;

/// <summary>
/// Represents a Lesson within a Module, created by a Teacher.
/// </summary>
public class Lesson : BaseEntity, IMultiTenant
{
    public Guid SchoolId { get; set; }
    public Guid ModuleId { get; set; }
    public string SubTopic { get; set; } = null!;
    public string? Activity { get; set; }
    public string? VideoUrl { get; set; }
    public string? DiagramUrl { get; set; }
    public string? Code { get; set; }
    public string? Procedure { get; set; }
    public string? RequiredMaterial { get; set; }
    public string? WhatYouGet { get; set; }
    public Guid? CreatedByTeacherId { get; set; }  // Nullable: Staff can create lessons without TeacherId
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public Module Module { get; set; } = null!;
    public Teacher? CreatedByTeacher { get; set; }  // Nullable nav property
    public ICollection<Scheduler> Schedules { get; set; } = new List<Scheduler>();
}
