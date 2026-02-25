using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Veriton.Domain.Entities;

namespace Veriton.Infrastructure.Persistence.Configurations;

public class GradeConfiguration : IEntityTypeConfiguration<Grade>
{
    public void Configure(EntityTypeBuilder<Grade> builder)
    {
        builder.ToTable("grades");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnType("char(36)");
        
        builder.Property(x => x.GradeLevel).IsRequired().HasMaxLength(10);
        builder.Property(x => x.Section).IsRequired().HasMaxLength(10);
        builder.Property(x => x.GradeName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.AcademicYear).HasMaxLength(20);
        builder.Property(x => x.IsActive).HasDefaultValue(true);
        
        builder.HasOne(x => x.School).WithMany(x => x.Grades).HasForeignKey(x => x.SchoolId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.ClassTeacher).WithMany(x => x.ClassTeacherGrades).HasForeignKey(x => x.ClassTeacherId).OnDelete(DeleteBehavior.SetNull);
        
        builder.HasIndex(x => new { x.SchoolId, x.GradeLevel, x.Section, x.AcademicYear }).IsUnique();
    }
}
