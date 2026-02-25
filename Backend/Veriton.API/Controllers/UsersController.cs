using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Domain.Common;
using Veriton.Domain.Entities;
using Veriton.Application.Interfaces.Security;

namespace Veriton.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;

    public UsersController(IUserRepository userRepository, ICurrentUserService currentUserService)
    {
        _userRepository = userRepository;
        _currentUserService = currentUserService;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                        
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        
        var user = await _userRepository.GetByIdAsync(Guid.Parse(userIdStr), 
            u => u.Include(x => x.School));
            
        if (user == null) return NotFound();

        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            first_name = user.FirstName,
            last_name = user.LastName,
            full_name = $"{user.FirstName} {user.LastName}",
            role = user.Role,
            utype = user.Role switch
            {
                "SuperAdmin" => "admin",
                "Principal" => "principal",
                _ => user.Role.ToLower()
            },
            school_id = user.SchoolId,
            school_name = user.School?.Name,
            phone = user.Phone,
            is_active = user.IsActive
        });
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                        
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var user = await _userRepository.GetByIdAsync(Guid.Parse(userIdStr));
        if (user == null) return NotFound();

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Phone = request.Phone;

        await _userRepository.UpdateAsync(user);
        return NoContent();
    }


    [HttpGet]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> GetAll([FromQuery] string? role, [FromQuery] Guid? schoolId)
    {
        var users = await _userRepository.GetAllAsync(q => q.Include(u => u.School));
        
        IEnumerable<User> filtered = users;
        
        // Non-admins only see users in their own school
        if (_currentUserService.Role != "SuperAdmin" && _currentUserService.SchoolId.HasValue)
        {
            filtered = filtered.Where(u => u.SchoolId == _currentUserService.SchoolId);
        }
        
        if (!string.IsNullOrEmpty(role))
            filtered = filtered.Where(u => u.Role == role);
            
        if (schoolId.HasValue)
            filtered = filtered.Where(u => u.SchoolId == schoolId);

        var response = filtered.Select(u => new
        {
            id = u.Id,
            email = u.Email,
            first_name = u.FirstName,
            last_name = u.LastName,
            full_name = $"{u.FirstName} {u.LastName}",
            role = u.Role,
            utype = u.Role switch
            {
                "SuperAdmin" => "admin",
                "Principal" => "principal",
                _ => u.Role.ToLower()
            },
            school_id = u.SchoolId,
            school_name = u.School?.Name,
            is_active = u.IsActive,
            phone = u.Phone,
            created_at = u.CreatedAt
        });

        return Ok(response);
    }

    [HttpPost]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> Create(UserCreateRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        Console.WriteLine($"[UserCreate] Role: {request.Role}, Email: {request.Email}, SchoolId: {request.SchoolId}");

        var schoolId = _currentUserService.Role == "SuperAdmin" 
            ? request.SchoolId 
            : (_currentUserService.SchoolId ?? Guid.Empty);

        var existingUser = await _userRepository.GetByEmailAsync(request.Email.Trim().ToLower());
        if (existingUser != null)
            return BadRequest(new { message = "User with this email already exists" });

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var user = new User(request.Email.Trim().ToLower(), passwordHash, request.Role, schoolId);
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;

        await _userRepository.AddAsync(user);
        return Ok(new { id = user.Id, message = "User created successfully" });
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> Update(Guid id, UserUpdateRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.SetRole(request.Role);
        
        if (_currentUserService.Role == "SuperAdmin")
        {
            user.SchoolId = request.SchoolId;
        }
        
        if (request.IsActive) user.Activate();
        else user.Deactivate();

        await _userRepository.UpdateAsync(user);
        return NoContent();
    }

    /// <summary>
    /// Toggle user active/hold status
    /// </summary>
    [HttpPut("{id}/toggle-status")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> ToggleStatus(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();

        if (user.IsActive) user.Deactivate();
        else user.Activate();

        await _userRepository.UpdateAsync(user);
        return Ok(new { is_active = user.IsActive, message = user.IsActive ? "User activated" : "User put on hold" });
    }

    /// <summary>
    /// Reset a user's password to the default
    /// </summary>
    [HttpPut("{id}/reset-password")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> ResetPassword(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();

        var defaultPassword = user.Role switch
        {
            "Student" => "Student@123",
            "Teacher" => "Teacher@123",
            "Principal" => "Principal@123",
            "Staff" => "Staff@123",
            _ => "Default@123"
        };

        var newHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword);
        user.UpdatePassword(newHash);

        await _userRepository.UpdateAsync(user);
        return Ok(new { message = $"Password reset to default for {user.Email}" });
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();

        await _userRepository.DeleteAsync(user);
        return NoContent();
    }
}

// Records use PascalCase properties that match snake_case JSON thanks to SnakeCaseLower policy
public class UserCreateRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string Role { get; set; } = "Teacher";
    public Guid? SchoolId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

public class UserUpdateRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string Role { get; set; } = "Teacher";
    public Guid? SchoolId { get; set; }
    public bool IsActive { get; set; }
}

public class UpdateProfileRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
}
