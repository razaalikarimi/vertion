using Microsoft.EntityFrameworkCore;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Entities;
using Veriton.Application.Interfaces.Security;

namespace Veriton.Application.Services;

public class ModuleService : IGenericService<ModuleCreateDto, ModuleUpdateDto, ModuleDto>
{
    private readonly IGenericRepository<Module> _repository;
    private readonly ICurrentUserService _currentUserService;

    public ModuleService(IGenericRepository<Module> repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<List<ModuleDto>> GetAllAsync()
    {
        var modules = await _repository.GetAllAsync(q => q
            .Include(m => m.School)
            .Include(m => m.Grade)
            .Include(m => m.CreatedByTeacher)
            .Include(m => m.Lessons)
            .Include(m => m.Exams));

        return modules.Select(m => new ModuleDto
        {
            Id = m.Id,
            SchoolId = m.SchoolId,
            SchoolName = m.School?.Name ?? "",
            GradeId = m.GradeId,
            GradeName = m.Grade?.GradeName ?? "",
            Name = m.Name,
            Description = m.Description,
            Credits = m.Credits,
            CreatedByTeacherId = m.CreatedByTeacherId,
            CreatedByTeacherName = m.CreatedByTeacher != null
                ? $"{m.CreatedByTeacher.FirstName} {m.CreatedByTeacher.LastName}" : "System/Admin",
            IsActive = m.IsActive,
            LessonCount = m.Lessons?.Count ?? 0,
            ExamCount = m.Exams?.Count ?? 0
        }).ToList();
    }

    public async Task<ModuleDto?> GetByIdAsync(Guid id)
    {
        var m = await _repository.GetByIdAsync(id, q => q
            .Include(m => m.School)
            .Include(m => m.Grade)
            .Include(m => m.CreatedByTeacher)
            .Include(m => m.Lessons)
            .Include(m => m.Exams));
        if (m == null) return null;

        return new ModuleDto
        {
            Id = m.Id,
            SchoolId = m.SchoolId,
            SchoolName = m.School?.Name ?? "",
            GradeId = m.GradeId,
            GradeName = m.Grade?.GradeName ?? "",
            Name = m.Name,
            Description = m.Description,
            Credits = m.Credits,
            CreatedByTeacherId = m.CreatedByTeacherId,
            CreatedByTeacherName = m.CreatedByTeacher != null
                ? $"{m.CreatedByTeacher.FirstName} {m.CreatedByTeacher.LastName}" : "System/Admin",
            IsActive = m.IsActive,
            LessonCount = m.Lessons?.Count ?? 0,
            ExamCount = m.Exams?.Count ?? 0
        };
    }

    public async Task<Guid> CreateAsync(ModuleCreateDto dto)
    {
        var schoolId = dto.SchoolId ?? _currentUserService.SchoolId ?? Guid.Empty;
        
        var module = new Module
        {
            SchoolId = schoolId,
            GradeId = dto.GradeId,
            Name = dto.Name,
            Description = dto.Description,
            Credits = dto.Credits,
            CreatedByTeacherId = dto.CreatedByTeacherId,
            IsActive = true
        };

        await _repository.AddAsync(module);
        return module.Id;
    }

    public async Task UpdateAsync(Guid id, ModuleUpdateDto dto)
    {
        var module = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Module not found");

        if (dto.SchoolId.HasValue && _currentUserService.Role == "SuperAdmin")
        {
            module.SchoolId = dto.SchoolId.Value;
        }
        
        module.GradeId = dto.GradeId;
        module.Name = dto.Name;
        module.Description = dto.Description;
        module.Credits = dto.Credits;
        module.CreatedByTeacherId = dto.CreatedByTeacherId;
        module.IsActive = dto.IsActive;

        await _repository.UpdateAsync(module);
    }

    public async Task DeleteAsync(Guid id)
    {
        var module = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Module not found");

        await _repository.DeleteAsync(module);
    }
}