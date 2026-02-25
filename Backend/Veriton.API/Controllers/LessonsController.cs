using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Common;

namespace Veriton.API.Controllers;

[ApiController]
[Route("api/lessons")]
[Authorize]
public class LessonsController : ControllerBase
{
    private readonly ILessonService _service;
    private readonly IGenericService<LessonCreateDto, LessonUpdateDto, LessonDto> _genericService;

    public LessonsController(ILessonService service, IGenericService<LessonCreateDto, LessonUpdateDto, LessonDto> genericService)
    {
        _service = service;
        _genericService = genericService;
    }

    /// <summary>
    /// Get all lessons. Accessible by all authenticated roles.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "StudentOnly")]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    [Authorize(Policy = "StudentOnly")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var lesson = await _service.GetByIdAsync(id);
        return lesson == null ? NotFound() : Ok(lesson);
    }

    [HttpPost]
    [Authorize(Policy = "TeacherOnly")]  // Staff and above can create lessons
    public async Task<IActionResult> Create(LessonCreateDto dto)
        => Ok(new { id = await _service.CreateAsync(dto) });

    [HttpPut("{id}")]
    [Authorize(Policy = "TeacherOnly")]
    public async Task<IActionResult> Update(Guid id, LessonUpdateDto dto)
    {
        await _service.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "TeacherOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/complete")]
    [Authorize(Policy = "StudentOnly")]
    public async Task<IActionResult> MarkCompleted(Guid id)
    {
        await _service.MarkAsCompletedAsync(id);
        return Ok();
    }

    [HttpGet("completed")]
    [Authorize(Policy = "StudentOnly")]
    public async Task<IActionResult> GetCompleted()
        => Ok(await _service.GetCompletedLessonIdsAsync());
}
