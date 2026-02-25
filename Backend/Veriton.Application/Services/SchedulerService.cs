using Microsoft.EntityFrameworkCore;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Entities;
using Veriton.Application.Interfaces.Security;

namespace Veriton.Application.Services;

public class SchedulerService : IGenericService<SchedulerCreateDto, SchedulerUpdateDto, SchedulerDto>
{
    private readonly IGenericRepository<Scheduler> _repository;
    private readonly ICurrentUserService _currentUserService;

    public SchedulerService(IGenericRepository<Scheduler> repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<List<SchedulerDto>> GetAllAsync()
    {
        var schedules = await _repository.GetAllAsync(q => q
            .Include(s => s.Grade)
            .Include(s => s.Module)
            .Include(s => s.Lesson)
            .Include(s => s.Teacher));

        return schedules.Select(s => new SchedulerDto
        {
            Id = s.Id,
            GradeId = s.GradeId,
            GradeName = s.Grade?.GradeName ?? "",
            ModuleId = s.ModuleId,
            ModuleName = s.Module?.Name ?? "",
            LessonId = s.LessonId,
            LessonSubTopic = s.Lesson?.SubTopic,
            TeacherId = s.TeacherId,
            TeacherName = s.Teacher != null
                ? $"{s.Teacher.FirstName} {s.Teacher.LastName}" : "",
            Date = s.Date,
            StartTime = s.StartTime,
            EndTime = s.EndTime,
            IsActive = s.IsActive
        }).ToList();
    }

    public async Task<SchedulerDto?> GetByIdAsync(Guid id)
    {
        var s = await _repository.GetByIdAsync(id, q => q
            .Include(s => s.Grade)
            .Include(s => s.Module)
            .Include(s => s.Lesson)
            .Include(s => s.Teacher));
        if (s == null) return null;

        return new SchedulerDto
        {
            Id = s.Id,
            GradeId = s.GradeId,
            GradeName = s.Grade?.GradeName ?? "",
            ModuleId = s.ModuleId,
            ModuleName = s.Module?.Name ?? "",
            LessonId = s.LessonId,
            LessonSubTopic = s.Lesson?.SubTopic,
            TeacherId = s.TeacherId,
            TeacherName = s.Teacher != null
                ? $"{s.Teacher.FirstName} {s.Teacher.LastName}" : "",
            Date = s.Date,
            StartTime = s.StartTime,
            EndTime = s.EndTime,
            IsActive = s.IsActive
        };
    }

    public async Task<Guid> CreateAsync(SchedulerCreateDto dto)
    {
        var scheduler = new Scheduler
        {
            SchoolId = _currentUserService.SchoolId ?? Guid.Empty,
            GradeId = dto.GradeId,
            ModuleId = dto.ModuleId,
            LessonId = dto.LessonId,
            TeacherId = dto.TeacherId,
            Date = dto.Date.Date,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            IsActive = true
        };

        await _repository.AddAsync(scheduler);
        return scheduler.Id;
    }

    public async Task UpdateAsync(Guid id, SchedulerUpdateDto dto)
    {
        var scheduler = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Schedule not found");

        scheduler.GradeId = dto.GradeId;
        scheduler.ModuleId = dto.ModuleId;
        scheduler.LessonId = dto.LessonId;
        scheduler.TeacherId = dto.TeacherId;
        scheduler.Date = dto.Date.Date;
        scheduler.StartTime = dto.StartTime;
        scheduler.EndTime = dto.EndTime;
        scheduler.IsActive = dto.IsActive;

        await _repository.UpdateAsync(scheduler);
    }

    public async Task DeleteAsync(Guid id)
    {
        var scheduler = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Schedule not found");

        await _repository.DeleteAsync(scheduler);
    }
}
