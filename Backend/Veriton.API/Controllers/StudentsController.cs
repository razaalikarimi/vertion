using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Services;
using Veriton.Application.Services;
using Veriton.Domain.Common;

namespace Veriton.API.Controllers;

[ApiController]
[Route("api/students")]
[Authorize]
public class StudentsController : ControllerBase
{
    private readonly IGenericService<StudentCreateDto, StudentUpdateDto, StudentDto> _service;

    public StudentsController(IGenericService<StudentCreateDto, StudentUpdateDto, StudentDto> service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Policy = "TeacherOnly")]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    [Authorize(Policy = "TeacherOnly")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var student = await _service.GetByIdAsync(id);
        return student == null ? NotFound() : Ok(student);
    }

    /// <summary>
    /// Create a student. Teacher and above can create.
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "TeacherOnly")]
    public async Task<IActionResult> Create(StudentCreateDto dto)
        => Ok(new { id = await _service.CreateAsync(dto) });

    [HttpPut("{id}")]
    [Authorize(Policy = "TeacherOnly")]
    public async Task<IActionResult> Update(Guid id, StudentUpdateDto dto)
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

    [HttpPost("upload-csv")]
    [Authorize(Policy = "PrincipalOnly")]
    public async Task<IActionResult> UploadCsv(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        if (_service is StudentService studentService)
        {
            await studentService.BulkImportCsvAsync(file.OpenReadStream());
            return Ok(new { message = "Bulk import successful" });
        }

        return BadRequest("CSV import not supported for this service");
    }
}