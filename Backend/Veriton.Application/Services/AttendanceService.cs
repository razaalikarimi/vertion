using Microsoft.EntityFrameworkCore;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Security;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Entities;

namespace Veriton.Application.Services;

public class AttendanceService : IAttendanceService
{
    private readonly IGenericRepository<Attendance> _repository;
    private readonly IGenericRepository<Student> _studentRepo;
    private readonly ICurrentUserService _currentUserService;

    public AttendanceService(
        IGenericRepository<Attendance> repository, 
        IGenericRepository<Student> studentRepo,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _studentRepo = studentRepo;
        _currentUserService = currentUserService;
    }

    public async Task<TeacherAttendanceReportDto> GetTeacherMonthlyReportAsync(Guid teacherId, int month, int year)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var attendances = await _repository.GetAllAsync(q => 
            q.Where(a => a.TeacherId == teacherId && a.Date >= startDate && a.Date <= endDate));

        var report = new TeacherAttendanceReportDto
        {
            Month = startDate.ToString("MMMM yyyy"),
            PresentDays = attendances.Count(a => a.Status == AttendanceStatus.Present),
            AbsentDays = attendances.Count(a => a.Status == AttendanceStatus.Absent),
            LateDays = attendances.Count(a => a.Status == AttendanceStatus.Late),
            Records = attendances.OrderBy(a => a.Date).Select(a => new AttendanceRecordDto
            {
                Date = a.Date,
                Status = a.Status.ToString(),
                Remarks = a.Remarks
            }).ToList()
        };

        return report;
    }

    public async Task<List<AttendanceDto>> GetStudentAttendanceAsync(Guid gradeId, DateTime date)
    {
        var students = await _studentRepo.GetAllAsync(q => q.Where(s => s.GradeId == gradeId && s.IsActive));
        var attendances = await _repository.GetAllAsync(q => 
            q.Where(a => a.StudentId != null && a.Date.Date == date.Date));

        return students.Select(s => {
            var att = attendances.FirstOrDefault(a => a.StudentId == s.Id);
            return new AttendanceDto
            {
                Id = att?.Id ?? Guid.Empty,
                Date = date,
                Status = att?.Status.ToString() ?? "Absent", // Default to Absent or empty
                Remarks = att?.Remarks,
                StudentId = s.Id,
                StudentName = $"{s.FirstName} {s.LastName}"
            };
        }).ToList();
    }

    public async Task SaveAttendanceAsync(List<AttendanceDto> dtos)
    {
        foreach (var dto in dtos)
        {
            var status = Enum.Parse<AttendanceStatus>(dto.Status);
            if (dto.Id == Guid.Empty)
            {
                var attendance = new Attendance
                {
                    SchoolId = _currentUserService.SchoolId ?? Guid.Empty,
                    Date = dto.Date,
                    Status = status,
                    Remarks = dto.Remarks,
                    TeacherId = dto.TeacherId,
                    StudentId = dto.StudentId
                };
                await _repository.AddAsync(attendance);
            }
            else
            {
                var attendance = await _repository.GetByIdAsync(dto.Id);
                if (attendance != null)
                {
                    attendance.Status = status;
                    attendance.Remarks = dto.Remarks;
                    await _repository.UpdateAsync(attendance);
                }
            }
        }
    }
}
