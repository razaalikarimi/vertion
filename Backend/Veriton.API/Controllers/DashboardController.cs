using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Veriton.Application.Interfaces.Security;
using Veriton.Application.Interfaces.Services;


namespace Veriton.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ICurrentUserService _currentUserService;

    public DashboardController(IDashboardService dashboardService, ICurrentUserService currentUserService)
    {
        _dashboardService = dashboardService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get dashboard statistics. Accessible by Staff and above roles.
    /// </summary>
    [HttpGet("stats")]
    [Authorize(Policy = "TeacherOnly")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _dashboardService.GetStatsAsync(_currentUserService.SchoolId);
        return Ok(stats);
    }
}
