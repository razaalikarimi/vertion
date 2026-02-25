using System.Security.Claims;

namespace Veriton.Application.Interfaces.Security;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? Role { get; }
    Guid? SchoolId { get; }
    Guid? TeacherId { get; }
    Guid? StudentId { get; }
    Guid? GradeId { get; }
    bool IsAuthenticated { get; }
    ClaimsPrincipal User { get; }
}
