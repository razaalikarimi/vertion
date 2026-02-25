using Microsoft.EntityFrameworkCore;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Entities;
using Veriton.Application.Interfaces.Security;

namespace Veriton.Application.Services;

public class LessonService : ILessonService
{
    private readonly IGenericRepository<Lesson> _repository;
    private readonly IGenericRepository<LessonCompletion> _completionRepository;
    private readonly ICurrentUserService _currentUserService;

    public LessonService(
        IGenericRepository<Lesson> repository, 
        IGenericRepository<LessonCompletion> completionRepository,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _completionRepository = completionRepository;
        _currentUserService = currentUserService;
    }

    public async Task<List<LessonDto>> GetAllAsync()
    {
        var lessons = await _repository.GetAllAsync(q => q
            .Include(l => l.Module)
            .Include(l => l.CreatedByTeacher));

        return lessons.Select(l => new LessonDto
        {
            Id = l.Id,
            ModuleId = l.ModuleId,
            ModuleName = l.Module?.Name ?? "",
            SubTopic = l.SubTopic,
            Activity = l.Activity,
            VideoUrl = l.VideoUrl,
            DiagramUrl = l.DiagramUrl,
            Code = l.Code,
            Procedure = l.Procedure,
            RequiredMaterial = l.RequiredMaterial,
            WhatYouGet = l.WhatYouGet,
            CreatedByTeacherId = l.CreatedByTeacherId,
            CreatedByTeacherName = l.CreatedByTeacher != null
                ? $"{l.CreatedByTeacher.FirstName} {l.CreatedByTeacher.LastName}" : "",
            IsActive = l.IsActive,
            CreatedAt = l.CreatedAt
        }).ToList();
    }

    public async Task<LessonDto?> GetByIdAsync(Guid id)
    {
        var l = await _repository.GetByIdAsync(id, q => q
            .Include(l => l.Module)
            .Include(l => l.CreatedByTeacher));
        if (l == null) return null;

        return new LessonDto
        {
            Id = l.Id,
            ModuleId = l.ModuleId,
            ModuleName = l.Module?.Name ?? "",
            SubTopic = l.SubTopic,
            Activity = l.Activity,
            VideoUrl = l.VideoUrl,
            DiagramUrl = l.DiagramUrl,
            Code = l.Code,
            Procedure = l.Procedure,
            RequiredMaterial = l.RequiredMaterial,
            WhatYouGet = l.WhatYouGet,
            CreatedByTeacherId = l.CreatedByTeacherId,
            CreatedByTeacherName = l.CreatedByTeacher != null
                ? $"{l.CreatedByTeacher.FirstName} {l.CreatedByTeacher.LastName}" : "",
            IsActive = l.IsActive,
            CreatedAt = l.CreatedAt
        };
    }

    public async Task<Guid> CreateAsync(LessonCreateDto dto)
    {
        // Resolve teacher ID - use DTO value if provided, otherwise use current user's TeacherId
        var teacherId = dto.CreatedByTeacherId
            ?? _currentUserService.TeacherId;

        var lesson = new Lesson
        {
            SchoolId = _currentUserService.SchoolId ?? Guid.Empty,
            ModuleId = dto.ModuleId,
            SubTopic = dto.SubTopic,
            Activity = dto.Activity,
            VideoUrl = dto.VideoUrl,
            DiagramUrl = dto.DiagramUrl,
            Code = dto.Code,
            Procedure = dto.Procedure,
            RequiredMaterial = dto.RequiredMaterial,
            WhatYouGet = dto.WhatYouGet,
            CreatedByTeacherId = teacherId,
            IsActive = true
        };

        await _repository.AddAsync(lesson);
        return lesson.Id;
    }

    public async Task UpdateAsync(Guid id, LessonUpdateDto dto)
    {
        var lesson = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Lesson not found");

        lesson.ModuleId = dto.ModuleId;
        lesson.SubTopic = dto.SubTopic;
        lesson.Activity = dto.Activity;
        lesson.VideoUrl = dto.VideoUrl;
        lesson.DiagramUrl = dto.DiagramUrl;
        lesson.Code = dto.Code;
        lesson.Procedure = dto.Procedure;
        lesson.RequiredMaterial = dto.RequiredMaterial;
        lesson.WhatYouGet = dto.WhatYouGet;
        // Only update TeacherId if explicitly provided in the DTO
        if (dto.CreatedByTeacherId.HasValue)
            lesson.CreatedByTeacherId = dto.CreatedByTeacherId;
        lesson.IsActive = dto.IsActive;

        await _repository.UpdateAsync(lesson);
    }

    public async Task DeleteAsync(Guid id)
    {
        var lesson = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Lesson not found");

        await _repository.DeleteAsync(lesson);
    }

    public async Task MarkAsCompletedAsync(Guid lessonId)
    {
        var studentId = _currentUserService.StudentId ?? Guid.Empty;
        if (studentId == Guid.Empty) throw new Exception("Only students can mark lessons as complete");

        var existing = await _completionRepository.GetAllAsync(q => 
            q.Where(c => c.LessonId == lessonId && c.StudentId == studentId));

        if (existing.Any()) return;

        var completion = new LessonCompletion
        {
            SchoolId = _currentUserService.SchoolId ?? Guid.Empty,
            StudentId = studentId,
            LessonId = lessonId,
            CompletionDate = DateTime.UtcNow
        };

        await _completionRepository.AddAsync(completion);
    }

    public async Task<List<Guid>> GetCompletedLessonIdsAsync()
    {
        var studentId = _currentUserService.StudentId ?? Guid.Empty;
        if (studentId == Guid.Empty) return new List<Guid>();

        var completions = await _completionRepository.GetAllAsync(q => 
            q.Where(c => c.StudentId == studentId));

        return completions.Select(c => c.LessonId).ToList();
    }
}
