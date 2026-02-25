using Microsoft.EntityFrameworkCore;
using Veriton.Domain.Entities;
using Veriton.Application.Interfaces.Security;

namespace Veriton.Infrastructure.Persistence.DbContext;

public class AppDbContext : Microsoft.EntityFrameworkCore.DbContext
{
    private readonly ICurrentUserService? _currentUserService;

    public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUserService currentUserService) 
        : base(options) 
    {
        _currentUserService = currentUserService;
    }

    // Preserved tables
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<School> Schools { get; set; } = null!;
    public DbSet<Grade> Grades { get; set; } = null!;
    public DbSet<Teacher> Teachers { get; set; } = null!;
    public DbSet<Student> Students { get; set; } = null!;

    // New tables (School Operational LMS)
    public DbSet<Module> Modules { get; set; } = null!;
    public DbSet<Lesson> Lessons { get; set; } = null!;
    public DbSet<Scheduler> Schedulers { get; set; } = null!;
    public DbSet<Exam> Exams { get; set; } = null!;
    public DbSet<Question> Questions { get; set; } = null!;
    public DbSet<Result> Results { get; set; } = null!;
    public DbSet<Attendance> Attendances { get; set; } = null!;
    public DbSet<LessonCompletion> LessonCompletions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        var schoolId = _currentUserService?.SchoolId;
        var role = _currentUserService?.Role;
        var teacherId = _currentUserService?.TeacherId;
        var studentId = _currentUserService?.StudentId;
        var gradeId = _currentUserService?.GradeId;

        // If SuperAdmin or Anonymous, bypass filters
        if (string.IsNullOrEmpty(role) || role == "SuperAdmin") return;

        // Apply Multi-Tenant Filters
        if (schoolId.HasValue)
        {
            modelBuilder.Entity<Grade>().HasQueryFilter(x => x.SchoolId == schoolId.Value);
            modelBuilder.Entity<Teacher>().HasQueryFilter(x => x.SchoolId == schoolId.Value);
            modelBuilder.Entity<Student>().HasQueryFilter(x => x.SchoolId == schoolId.Value);
            modelBuilder.Entity<Module>().HasQueryFilter(x => x.SchoolId == schoolId.Value);
            modelBuilder.Entity<Lesson>().HasQueryFilter(x => x.SchoolId == schoolId.Value);
            modelBuilder.Entity<Exam>().HasQueryFilter(x => x.SchoolId == schoolId.Value);
            modelBuilder.Entity<Scheduler>().HasQueryFilter(x => x.SchoolId == schoolId.Value);
            modelBuilder.Entity<Result>().HasQueryFilter(x => x.SchoolId == schoolId.Value);
            modelBuilder.Entity<Attendance>().HasQueryFilter(x => x.SchoolId == schoolId.Value);
            modelBuilder.Entity<LessonCompletion>().HasQueryFilter(x => x.SchoolId == schoolId.Value);
            modelBuilder.Entity<User>().HasQueryFilter(x => x.SchoolId == schoolId.Value);
        }

        // Apply Ownership Filters for Teachers
        if (role == "Teacher" && teacherId.HasValue)
        {
            modelBuilder.Entity<Exam>().HasQueryFilter(x => x.CreatedByTeacherId == teacherId.Value);
            modelBuilder.Entity<Scheduler>().HasQueryFilter(x => x.TeacherId == teacherId.Value);
        }

        // Apply Ownership Filters for Students
        if (role == "Student" && studentId.HasValue)
        {
            // Only see self
            modelBuilder.Entity<Student>().HasQueryFilter(x => x.Id == studentId.Value);

            // Access curriculum ONLY for assigned Grade
            if (gradeId.HasValue)
            {
                modelBuilder.Entity<Grade>().HasQueryFilter(x => x.Id == gradeId.Value);
                modelBuilder.Entity<Module>().HasQueryFilter(x => x.GradeId == gradeId.Value);
                modelBuilder.Entity<Lesson>().HasQueryFilter(x => x.Module.GradeId == gradeId.Value);
                modelBuilder.Entity<Exam>().HasQueryFilter(x => x.GradeId == gradeId.Value);
                modelBuilder.Entity<Scheduler>().HasQueryFilter(x => x.GradeId == gradeId.Value);
                modelBuilder.Entity<Result>().HasQueryFilter(x => x.StudentId == studentId.Value && x.IsPublished);
            }
        }
    }
}
