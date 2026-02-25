using Microsoft.EntityFrameworkCore;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Entities;
using Veriton.Application.Interfaces.Security;

namespace Veriton.Application.Services;

public class ExamService : IGenericService<ExamCreateDto, ExamUpdateDto, ExamDto>
{
    private readonly IGenericRepository<Exam> _repository;
    private readonly ICurrentUserService _currentUserService;

    public ExamService(IGenericRepository<Exam> repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<List<ExamDto>> GetAllAsync()
    {
        var exams = await _repository.GetAllAsync(q => q
            .Include(e => e.Grade)
            .Include(e => e.Module)
            .Include(e => e.CreatedByTeacher)
            .Include(e => e.Questions));

        return exams.Select(e => new ExamDto
        {
            Id = e.Id,
            GradeId = e.GradeId,
            GradeName = e.Grade?.GradeName ?? "",
            ModuleId = e.ModuleId,
            ModuleName = e.Module?.Name ?? "",
            Date = e.Date,
            CreatedByTeacherId = e.CreatedByTeacherId,
            CreatedByTeacherName = e.CreatedByTeacher != null
                ? $"{e.CreatedByTeacher.FirstName} {e.CreatedByTeacher.LastName}" : "",
            Title = e.Title,
            TotalMarks = e.TotalMarks,
            DurationMinutes = e.DurationMinutes,
            IsActive = e.IsActive,
            QuestionCount = e.Questions?.Count ?? 0,
            CreatedAt = e.CreatedAt
        }).ToList();
    }

    public async Task<ExamDto?> GetByIdAsync(Guid id)
    {
        var e = await _repository.GetByIdAsync(id, q => q
            .Include(e => e.Grade)
            .Include(e => e.Module)
            .Include(e => e.CreatedByTeacher)
            .Include(e => e.Questions));
        if (e == null) return null;

        return new ExamDto
        {
            Id = e.Id,
            GradeId = e.GradeId,
            GradeName = e.Grade?.GradeName ?? "",
            ModuleId = e.ModuleId,
            ModuleName = e.Module?.Name ?? "",
            Date = e.Date,
            CreatedByTeacherId = e.CreatedByTeacherId,
            CreatedByTeacherName = e.CreatedByTeacher != null
                ? $"{e.CreatedByTeacher.FirstName} {e.CreatedByTeacher.LastName}" : "",
            Title = e.Title,
            TotalMarks = e.TotalMarks,
            DurationMinutes = e.DurationMinutes,
            IsActive = e.IsActive,
            QuestionCount = e.Questions?.Count ?? 0,
            CreatedAt = e.CreatedAt
        };
    }

    public async Task<Guid> CreateAsync(ExamCreateDto dto)
    {
        var schoolId = _currentUserService.SchoolId ?? Guid.Empty;
        var teacherId = dto.CreatedByTeacherId ?? _currentUserService.TeacherId ?? Guid.Empty;

        var exam = new Exam
        {
            SchoolId = schoolId,
            GradeId = dto.GradeId,
            ModuleId = dto.ModuleId,
            Date = dto.Date.Date,
            CreatedByTeacherId = teacherId,
            Title = dto.Title,
            TotalMarks = dto.TotalMarks,
            DurationMinutes = dto.DurationMinutes,
            IsActive = true
        };

        await _repository.AddAsync(exam);
        return exam.Id;
    }

    public async Task UpdateAsync(Guid id, ExamUpdateDto dto)
    {
        var exam = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Exam not found");

        exam.GradeId = dto.GradeId;
        exam.ModuleId = dto.ModuleId;
        exam.Date = dto.Date.Date;
        exam.CreatedByTeacherId = dto.CreatedByTeacherId ?? exam.CreatedByTeacherId;
        exam.Title = dto.Title;
        exam.TotalMarks = dto.TotalMarks;
        exam.DurationMinutes = dto.DurationMinutes;
        exam.IsActive = dto.IsActive;

        await _repository.UpdateAsync(exam);
    }

    public async Task DeleteAsync(Guid id)
    {
        var exam = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Exam not found");

        await _repository.DeleteAsync(exam);
    }
}
