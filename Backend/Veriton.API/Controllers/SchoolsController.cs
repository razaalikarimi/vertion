using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Common;

namespace Veriton.API.Controllers;

[ApiController]
[Route("api/schools")]
[Authorize]
public class SchoolsController : ControllerBase
{
    private readonly IGenericService<SchoolCreateDto, SchoolUpdateDto, SchoolDto> _service;
    private readonly ILogger<SchoolsController> _logger;

    public SchoolsController(
        IGenericService<SchoolCreateDto, SchoolUpdateDto, SchoolDto> service,
        ILogger<SchoolsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Policy = "PrincipalOnly")]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    [Authorize(Policy = "PrincipalOnly")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var school = await _service.GetByIdAsync(id);
        return school == null ? NotFound() : Ok(school);
    }

    [HttpPost]
    [Authorize(Policy = "PrincipalOnly")]
    public async Task<IActionResult> Create(SchoolCreateDto dto)
    {
        try
        {
            var id = await _service.CreateAsync(dto);
            return Ok(new { id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create school");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "PrincipalOnly")]
    public async Task<IActionResult> Update(Guid id, SchoolUpdateDto dto)
    {
        try
        {
            await _service.UpdateAsync(id, dto);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update school {Id}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete school {Id}", id);
            return BadRequest(new { message = ex.Message });
        }
    }
}
