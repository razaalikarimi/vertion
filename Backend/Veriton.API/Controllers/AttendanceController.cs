using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Security;
using Veriton.Application.Interfaces.Services;

namespace Veriton.API.Controllers;

[ApiController]
[Route("api/attendance")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;
    private readonly ICurrentUserService _currentUserService;

    public AttendanceController(IAttendanceService attendanceService, ICurrentUserService currentUserService)
    {
        _attendanceService = attendanceService;
        _currentUserService = currentUserService;
    }

    [HttpGet("teacher-report")]
    [Authorize(Policy = "TeacherOnly")]
    public async Task<IActionResult> GetTeacherReport([FromQuery] int month, [FromQuery] int year)
    {
        var teacherId = _currentUserService.TeacherId ?? Guid.Empty;
        if (teacherId == Guid.Empty) return BadRequest("Teacher identity not found");

        var report = await _attendanceService.GetTeacherMonthlyReportAsync(teacherId, month, year);
        return Ok(report);
    }

    [HttpGet("students")]
    [Authorize(Policy = "TeacherOnly")]
    public async Task<IActionResult> GetStudentAttendance([FromQuery] Guid gradeId, [FromQuery] DateTime date)
    {
        var attendances = await _attendanceService.GetStudentAttendanceAsync(gradeId, date);
        return Ok(attendances);
    }

    [HttpPost("save")]
    [Authorize(Policy = "TeacherOnly")]
    public async Task<IActionResult> SaveAttendance([FromBody] List<AttendanceDto> dtos)
    {
        await _attendanceService.SaveAttendanceAsync(dtos);
        return Ok(new { message = "Attendance saved successfully" });
    }
}
