using Microsoft.EntityFrameworkCore;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Entities;
using Veriton.Application.Interfaces.Security;

namespace Veriton.Application.Services;

public class TeacherService : IGenericService<TeacherCreateDto, TeacherUpdateDto, TeacherDto>
{
    private readonly IGenericRepository<Teacher> _repository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;

    public TeacherService(IGenericRepository<Teacher> repository, IUserRepository userRepository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
    }

    public async Task<List<TeacherDto>> GetAllAsync()
    {
        var teachers = await _repository.GetAllAsync(q => q.Include(t => t.School));
        
        return teachers.Select(t => new TeacherDto
        {
            Id = t.Id,
            SchoolId = t.SchoolId,
            SchoolName = t.School?.Name ?? "",
            EmployeeId = t.EmployeeId,
            FirstName = t.FirstName,
            LastName = t.LastName,
            FullName = $"{t.FirstName} {t.LastName}",
            Email = t.Email,
            Phone = t.Phone,
            Gender = t.Gender,
            Qualification = t.Qualification,
            Specialization = t.Specialization,
            IsActive = t.IsActive
        }).ToList();
    }

    public async Task<TeacherDto?> GetByIdAsync(Guid id)
    {
        var t = await _repository.GetByIdAsync(id, q => q.Include(t => t.School));
        if (t == null) return null;

        return new TeacherDto
        {
            Id = t.Id,
            SchoolId = t.SchoolId,
            SchoolName = t.School?.Name ?? "",
            EmployeeId = t.EmployeeId,
            FirstName = t.FirstName,
            LastName = t.LastName,
            FullName = $"{t.FirstName} {t.LastName}",
            Email = t.Email,
            Phone = t.Phone,
            Gender = t.Gender,
            Qualification = t.Qualification,
            Specialization = t.Specialization,
            IsActive = t.IsActive
        };
    }

    public async Task<Guid> CreateAsync(TeacherCreateDto dto)
    {
        var schoolId = (dto.SchoolId != null && dto.SchoolId != Guid.Empty) 
            ? dto.SchoolId.Value 
            : (_currentUserService.SchoolId ?? Guid.Empty);

        var user = new User(
            email: dto.Email.ToLower().Trim(),
            passwordHash: BCrypt.Net.BCrypt.HashPassword("Teacher@123"),
            role: "Teacher",
            schoolId: schoolId
        );
        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Phone = dto.Phone;

        await _userRepository.AddAsync(user);

        var teacher = new Teacher
        {
            SchoolId = schoolId,
            UserId = user.Id,
            EmployeeId = dto.EmployeeId,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            JoiningDate = dto.JoiningDate ?? DateTime.UtcNow,
            Qualification = dto.Qualification,
            Specialization = dto.Specialization,
            Salary = dto.Salary,
            IsActive = true
        };

        await _repository.AddAsync(teacher);
        return teacher.Id;
    }

    public async Task UpdateAsync(Guid id, TeacherUpdateDto dto)
    {
        var teacher = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Teacher not found");

        if (_currentUserService.Role == "SuperAdmin" && dto.SchoolId.HasValue)
        {
            teacher.SchoolId = dto.SchoolId.Value;
        }
        
        teacher.EmployeeId = dto.EmployeeId;
        teacher.FirstName = dto.FirstName;
        teacher.LastName = dto.LastName;
        teacher.Email = dto.Email;
        teacher.Phone = dto.Phone;
        teacher.Address = dto.Address;
        teacher.DateOfBirth = dto.DateOfBirth;
        teacher.Gender = dto.Gender;
        teacher.JoiningDate = dto.JoiningDate;
        teacher.Qualification = dto.Qualification;
        teacher.Specialization = dto.Specialization;
        teacher.Salary = dto.Salary;
        teacher.IsActive = dto.IsActive;

        await _repository.UpdateAsync(teacher);
    }

    public async Task DeleteAsync(Guid id)
    {
        var teacher = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Teacher not found");

        await _repository.DeleteAsync(teacher);
    }
}