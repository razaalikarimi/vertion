using Veriton.Application.DTOs;

namespace Veriton.Application.Interfaces.Services;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync(Guid? schoolId = null);
}
