using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Common;

namespace Veriton.API.Controllers;

[ApiController]
[Route("api/teachers")]
[Authorize]
public class TeachersController : ControllerBase
{
    private readonly IGenericService<TeacherCreateDto, TeacherUpdateDto, TeacherDto> _service;

    public TeachersController(IGenericService<TeacherCreateDto, TeacherUpdateDto, TeacherDto> service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Policy = "PrincipalOnly")]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    [Authorize(Policy = "PrincipalOnly")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var teacher = await _service.GetByIdAsync(id);
        return teacher == null ? NotFound() : Ok(teacher);
    }

    /// <summary>
    /// Create a teacher. Staff and above can create.
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> Create(TeacherCreateDto dto)
        => Ok(new { id = await _service.CreateAsync(dto) });

    [HttpPut("{id}")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> Update(Guid id, TeacherUpdateDto dto)
    {
        await _service.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}