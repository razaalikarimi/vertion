using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Entities;
using Veriton.Application.Interfaces.Security;

namespace Veriton.Application.Services;

public class GenericSchoolService
    : IGenericService<SchoolCreateDto, SchoolUpdateDto, SchoolDto>
{
    private readonly IGenericRepository<School> _repository;
    private readonly ICurrentUserService _currentUserService;

    public GenericSchoolService(IGenericRepository<School> repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<List<SchoolDto>> GetAllAsync()
    {
        IEnumerable<School> schools = await _repository.GetAllAsync();

        if (_currentUserService.Role != "SuperAdmin" && _currentUserService.SchoolId.HasValue)
        {
            schools = schools.Where(s => s.Id == _currentUserService.SchoolId.Value);
        }

        return schools.Select(s => new SchoolDto
        {
            Id = s.Id,
            SchoolCode = s.SchoolCode,
            Name = s.Name,
            Address = s.Address,
            ContactEmail = s.ContactEmail,
            ContactPhone = s.ContactPhone,
            LogoUrl = s.LogoUrl,
            IsActive = s.IsActive
        }).ToList();
    }

    public async Task<SchoolDto?> GetByIdAsync(Guid id)
    {
        var s = await _repository.GetByIdAsync(id);
        if (s == null) return null;

        return new SchoolDto
        {
            Id = s.Id,
            SchoolCode = s.SchoolCode,
            Name = s.Name,
            Address = s.Address,
            ContactEmail = s.ContactEmail,
            ContactPhone = s.ContactPhone,
            LogoUrl = s.LogoUrl,
            IsActive = s.IsActive
        };
    }

    public async Task<Guid> CreateAsync(SchoolCreateDto dto)
    {
        // Simple check for duplicate school code using the repository
        var allSchools = await _repository.GetAllAsync();
        if (allSchools.Any(s => s.SchoolCode.Trim().ToLower() == dto.SchoolCode.Trim().ToLower()))
        {
            throw new Exception($"School with code '{dto.SchoolCode}' already exists.");
        }

        var school = new School
        {
            SchoolCode = dto.SchoolCode,
            Name = dto.Name,
            Address = dto.Address,
            ContactEmail = dto.ContactEmail,
            ContactPhone = dto.ContactPhone,
            LogoUrl = dto.LogoUrl,
            IsActive = true
        };

        await _repository.AddAsync(school);
        return school.Id;
    }

    public async Task UpdateAsync(Guid id, SchoolUpdateDto dto)
    {
        var school = await _repository.GetByIdAsync(id)
            ?? throw new Exception("School not found");

        school.SchoolCode = dto.SchoolCode;
        school.Name = dto.Name;
        school.Address = dto.Address;
        school.ContactEmail = dto.ContactEmail;
        school.ContactPhone = dto.ContactPhone;
        school.LogoUrl = dto.LogoUrl;
        school.IsActive = dto.IsActive;

        await _repository.UpdateAsync(school);
    }

    public async Task DeleteAsync(Guid id)
    {
        var school = await _repository.GetByIdAsync(id)
            ?? throw new Exception("School not found");

        await _repository.DeleteAsync(school);
    }
}
