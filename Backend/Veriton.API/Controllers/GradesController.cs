using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Common;

namespace Veriton.API.Controllers;

[ApiController]
[Route("api/grades")]
[Authorize]
public class GradesController : ControllerBase
{
    private readonly IGenericService<GradeCreateDto, GradeUpdateDto, GradeDto> _service;

    public GradesController(IGenericService<GradeCreateDto, GradeUpdateDto, GradeDto> service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = AppRoles.AllRoles)]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    [Authorize(Roles = AppRoles.AllRoles)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var grade = await _service.GetByIdAsync(id);
        return grade == null ? NotFound() : Ok(grade);
    }

    [HttpPost]
    [Authorize(Policy = "PrincipalOnly")]  // Staff and above can create grades
    public async Task<IActionResult> Create(GradeCreateDto dto)
        => Ok(new { id = await _service.CreateAsync(dto) });

    [HttpPut("{id}")]
    [Authorize(Policy = "PrincipalOnly")]
    public async Task<IActionResult> Update(Guid id, GradeUpdateDto dto)
    {
        await _service.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "PrincipalOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}