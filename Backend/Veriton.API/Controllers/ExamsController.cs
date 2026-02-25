using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Common;

namespace Veriton.API.Controllers;

[ApiController]
[Route("api/exams")]
[Authorize]
public class ExamsController : ControllerBase
{
    private readonly IGenericService<ExamCreateDto, ExamUpdateDto, ExamDto> _service;

    public ExamsController(IGenericService<ExamCreateDto, ExamUpdateDto, ExamDto> service)
    {
        _service = service;
    }

    /// <summary>
    /// Get all exams. Accessible by all authenticated roles.
    /// Students can view exams.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "StudentOnly")]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    [Authorize(Policy = "StudentOnly")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var exam = await _service.GetByIdAsync(id);
        return exam == null ? NotFound() : Ok(exam);
    }

    [HttpPost]
    [Authorize(Policy = "TeacherOnly")]
    public async Task<IActionResult> Create(ExamCreateDto dto)
        => Ok(new { id = await _service.CreateAsync(dto) });

    [HttpPut("{id}")]
    [Authorize(Policy = "TeacherOnly")]
    public async Task<IActionResult> Update(Guid id, ExamUpdateDto dto)
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
}
