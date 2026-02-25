using Microsoft.EntityFrameworkCore;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Services;
using Veriton.Application.Interfaces.Security;
using Veriton.Domain.Entities;

namespace Veriton.Application.Services;

public class StudentService : IGenericService<StudentCreateDto, StudentUpdateDto, StudentDto>
{
    private readonly IGenericRepository<Student> _repository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IGenericRepository<LessonCompletion> _completionRepository;
    private readonly IGenericRepository<Lesson> _lessonRepository;

    public StudentService(
        IGenericRepository<Student> repository, 
        IUserRepository userRepository, 
        ICurrentUserService currentUserService,
        IGenericRepository<LessonCompletion> completionRepository,
        IGenericRepository<Lesson> lessonRepository)
    {
        _repository = repository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
        _completionRepository = completionRepository;
        _lessonRepository = lessonRepository;
    }

    public async Task<List<StudentDto>> GetAllAsync()
    {
        var students = await _repository.GetAllAsync(q => q.Include(s => s.School).Include(s => s.Grade));
        var completions = await _completionRepository.GetAllAsync();
        var lessons = await _lessonRepository.GetAllAsync(q => q.Include(l => l.Module));

        return students.Select(s => {
            var totalLessons = lessons.Count(l => l.Module.GradeId == s.GradeId);
            var completedCount = completions.Count(c => c.StudentId == s.Id);
            
            return new StudentDto
            {
                Id = s.Id,
                SchoolId = s.SchoolId,
                SchoolName = s.School?.Name ?? "",
                GradeId = s.GradeId,
                GradeName = s.Grade?.GradeName ?? "",
                StudentId = s.StudentId,
                RollNo = s.RollNo,
                FirstName = s.FirstName,
                LastName = s.LastName,
                FullName = $"{s.FirstName} {s.LastName}",
                Email = s.Email,
                Phone = s.Phone,
                DateOfBirth = s.DateOfBirth,
                Gender = s.Gender,
                ParentGuardianName = s.ParentGuardianName,
                ParentGuardianPhone = s.ParentGuardianPhone,
                IsActive = s.IsActive,
                ProgressPercentage = totalLessons == 0 ? 0 : Math.Round((double)completedCount / totalLessons * 100, 2)
            };
        }).ToList();
    }

    public async Task<StudentDto?> GetByIdAsync(Guid id)
    {
        var s = await _repository.GetByIdAsync(id, q => q.Include(s => s.School).Include(s => s.Grade));
        if (s == null) return null;

        return new StudentDto
        {
            Id = s.Id,
            SchoolId = s.SchoolId,
            SchoolName = s.School?.Name ?? "",
            GradeId = s.GradeId,
            GradeName = s.Grade?.GradeName ?? "",
            StudentId = s.StudentId,
            RollNo = s.RollNo,
            FirstName = s.FirstName,
            LastName = s.LastName,
            FullName = $"{s.FirstName} {s.LastName}",
            Email = s.Email,
            Phone = s.Phone,
            DateOfBirth = s.DateOfBirth,
            Gender = s.Gender,
            ParentGuardianName = s.ParentGuardianName,
            ParentGuardianPhone = s.ParentGuardianPhone,
            IsActive = s.IsActive
        };
    }

    public async Task<Guid> CreateAsync(StudentCreateDto dto)
    {
        var schoolId = (dto.SchoolId != null && dto.SchoolId != Guid.Empty) 
            ? dto.SchoolId.Value 
            : (_currentUserService.SchoolId ?? Guid.Empty);

        User? user = null;
        if (!string.IsNullOrEmpty(dto.Email))
        {
            user = new User(
                email: dto.Email.ToLower().Trim(),
                passwordHash: BCrypt.Net.BCrypt.HashPassword("Student@123"),
                role: "Student",
                schoolId: schoolId
            );
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Phone = dto.Phone;

            await _userRepository.AddAsync(user);
        }

        var student = new Student
        {
            SchoolId = schoolId,
            GradeId = dto.GradeId,
            UserId = user?.Id,
            StudentId = dto.StudentId,
            RollNo = dto.RollNo,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            BloodGroup = dto.BloodGroup,
            Address = dto.Address,
            AdmissionDate = dto.AdmissionDate ?? DateTime.UtcNow,
            ParentGuardianName = dto.ParentGuardianName,
            ParentGuardianPhone = dto.ParentGuardianPhone,
            ParentGuardianEmail = dto.ParentGuardianEmail,
            EmergencyContact = dto.EmergencyContact,
            IsActive = true
        };

        await _repository.AddAsync(student);
        return student.Id;
    }

    public async Task UpdateAsync(Guid id, StudentUpdateDto dto)
    {
        var student = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Student not found");

        if (_currentUserService.Role == "SuperAdmin" && dto.SchoolId.HasValue)
        {
            student.SchoolId = dto.SchoolId.Value;
        }
        
        student.GradeId = dto.GradeId;
        student.StudentId = dto.StudentId;
        student.RollNo = dto.RollNo;
        student.FirstName = dto.FirstName;
        student.LastName = dto.LastName;
        student.Email = dto.Email;
        student.Phone = dto.Phone;
        student.DateOfBirth = dto.DateOfBirth;
        student.Gender = dto.Gender;
        student.BloodGroup = dto.BloodGroup;
        student.Address = dto.Address;
        student.AdmissionDate = dto.AdmissionDate;
        student.ParentGuardianName = dto.ParentGuardianName;
        student.ParentGuardianPhone = dto.ParentGuardianPhone;
        student.ParentGuardianEmail = dto.ParentGuardianEmail;
        student.EmergencyContact = dto.EmergencyContact;
        student.IsActive = dto.IsActive;

        await _repository.UpdateAsync(student);
    }

    public async Task DeleteAsync(Guid id)
    {
        var student = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Student not found");

        await _repository.DeleteAsync(student);
    }

    public async Task BulkImportCsvAsync(Stream stream)
    {
        using var reader = new StreamReader(stream);
        var header = await reader.ReadLineAsync(); 
        
        string? line;
        while ((line = await reader.ReadLineAsync()) != null)
        {
            if (string.IsNullOrWhiteSpace(line)) continue;
            
            var values = line.Split(',');
            if (values.Length < 5) continue;

            var dto = new StudentCreateDto
            {
                FirstName = values[0].Trim(),
                LastName = values[1].Trim(),
                Email = values[2].Trim(),
                StudentId = values[3].Trim(),
                GradeId = Guid.TryParse(values[4].Trim(), out var gid) ? gid : Guid.Empty
            };

            try 
            {
                await CreateAsync(dto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($@"[CSV Import Error] {ex.Message}");
            }
        }
    }
}