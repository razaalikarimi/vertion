using Microsoft.EntityFrameworkCore;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Entities;
using Veriton.Application.Interfaces.Security;

namespace Veriton.Application.Services;

public class GradeService : IGenericService<GradeCreateDto, GradeUpdateDto, GradeDto>
{
    private readonly IGenericRepository<Grade> _repository;
    private readonly ICurrentUserService _currentUserService;

    public GradeService(IGenericRepository<Grade> repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<List<GradeDto>> GetAllAsync()
    {
        var grades = await _repository.GetAllAsync(q => q.Include(g => g.School).Include(g => g.ClassTeacher).Include(g => g.Students));
        
        return grades.Select(g => new GradeDto
        {
            Id = g.Id,
            SchoolId = g.SchoolId,
            SchoolName = g.School?.Name ?? "",
            GradeLevel = g.GradeLevel,
            Section = g.Section,
            GradeName = g.GradeName,
            Capacity = g.Capacity,
            ClassTeacherId = g.ClassTeacherId,
            ClassTeacherName = g.ClassTeacher != null ? $"{g.ClassTeacher.FirstName} {g.ClassTeacher.LastName}" : null,
            ClassRoom = g.ClassRoom,
            AcademicYear = g.AcademicYear,
            IsActive = g.IsActive,
            StudentCount = g.Students?.Count ?? 0
        }).ToList();
    }

    public async Task<GradeDto?> GetByIdAsync(Guid id)
    {
        var g = await _repository.GetByIdAsync(id, q => q.Include(g => g.School).Include(g => g.ClassTeacher).Include(g => g.Students));
        if (g == null) return null;

        return new GradeDto
        {
            Id = g.Id,
            SchoolId = g.SchoolId,
            SchoolName = g.School?.Name ?? "",
            GradeLevel = g.GradeLevel,
            Section = g.Section,
            GradeName = g.GradeName,
            Capacity = g.Capacity,
            ClassTeacherId = g.ClassTeacherId,
            ClassTeacherName = g.ClassTeacher != null ? $"{g.ClassTeacher.FirstName} {g.ClassTeacher.LastName}" : null,
            ClassRoom = g.ClassRoom,
            AcademicYear = g.AcademicYear,
            IsActive = g.IsActive,
            StudentCount = g.Students?.Count ?? 0
        };
    }

    public async Task<Guid> CreateAsync(GradeCreateDto dto)
    {
        var grade = new Grade
        {
            SchoolId = _currentUserService.Role == "SuperAdmin" ? dto.SchoolId : (_currentUserService.SchoolId ?? Guid.Empty),
            GradeLevel = dto.GradeLevel,
            Section = dto.Section,
            GradeName = !string.IsNullOrEmpty(dto.GradeName) ? dto.GradeName : $"Grade {dto.GradeLevel} - {dto.Section}",
            Capacity = dto.Capacity ?? 0,
            ClassTeacherId = dto.ClassTeacherId,
            ClassRoom = dto.ClassRoom,
            AcademicYear = dto.AcademicYear,
            IsActive = true
        };

        await _repository.AddAsync(grade);
        return grade.Id;
    }

    public async Task UpdateAsync(Guid id, GradeUpdateDto dto)
    {
        var grade = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Grade not found");

        if (_currentUserService.Role == "SuperAdmin")
        {
            grade.SchoolId = dto.SchoolId;
        }
        
        grade.GradeLevel = dto.GradeLevel;
        grade.Section = dto.Section;
        grade.GradeName = !string.IsNullOrEmpty(dto.GradeName) ? dto.GradeName : $"Grade {dto.GradeLevel} - {dto.Section}";
        grade.Capacity = dto.Capacity ?? 0;
        grade.ClassTeacherId = dto.ClassTeacherId;
        grade.ClassRoom = dto.ClassRoom;
        grade.AcademicYear = dto.AcademicYear;
        grade.IsActive = dto.IsActive;

        await _repository.UpdateAsync(grade);
    }

    public async Task DeleteAsync(Guid id)
    {
        var grade = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Grade not found");

        await _repository.DeleteAsync(grade);
    }
}