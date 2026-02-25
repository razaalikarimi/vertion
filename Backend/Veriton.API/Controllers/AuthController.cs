using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Security;

namespace Veriton.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenService _jwtService;

    public AuthController(
        IUserRepository userRepository,
        IJwtTokenService jwtService)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
    }

    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                        
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var user = await _userRepository.GetByIdAsync(Guid.Parse(userIdStr));
        if (user == null) return NotFound();

        // Verify current password
        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Invalid current password" });
        }

        // Hash and update new password
        var newHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatePassword(newHash);

        await _userRepository.UpdateAsync(user);
        return Ok(new { message = "Password changed successfully" });
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.Email.Trim().ToLower());
        if (existingUser != null)
        {
            return BadRequest(new { message = "User with this email already exists." });
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password.Trim());
        var newUser = new Domain.Entities.User(
            request.Email.Trim().ToLower(),
            passwordHash,
            request.Role ?? "User"
        );
        
        if (!string.IsNullOrEmpty(request.FirstName)) newUser.FirstName = request.FirstName;
        if (!string.IsNullOrEmpty(request.LastName)) newUser.LastName = request.LastName;

        await _userRepository.AddAsync(newUser);

        return Ok(new { message = "Registration successful" });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        Console.WriteLine($"[Login Attempt] Email: {request.Email}");

        var user = await _userRepository.GetByEmailAsync(
            request.Email.Trim().ToLower());

        if (user == null)
        {
            Console.WriteLine("[Login Failed] User not found in database.");
            return Unauthorized(new { message = "Invalid credentials" });
        }

        Console.WriteLine($"[Login Debug] User found: {user.Email}. Checking password...");
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password.Trim(), user.PasswordHash);
        
        if (!isPasswordValid)
        {
            Console.WriteLine("[Login Failed] Password mismatch.");
            return Unauthorized(new { message = "Invalid credentials" });
        }

        Console.WriteLine("[Login Success] Generating token...");
        var token = _jwtService.GenerateToken(user);
        
        return Ok(new 
        { 
            token,
            user = new 
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
                phone = user.Phone,
                is_active = user.IsActive
            }
        });
    }
}

// Use classes instead of records so SnakeCaseLower JSON binding works
public class LoginRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

public class RegisterRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string? Role { get; set; } = "User";
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = "";
    public string NewPassword { get; set; } = "";
}
