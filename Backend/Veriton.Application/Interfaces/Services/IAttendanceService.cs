using Veriton.Application.DTOs;

namespace Veriton.Application.Interfaces.Services;

public interface IAttendanceService
{
    Task<TeacherAttendanceReportDto> GetTeacherMonthlyReportAsync(Guid teacherId, int month, int year);
    Task<List<AttendanceDto>> GetStudentAttendanceAsync(Guid gradeId, DateTime date);
    Task SaveAttendanceAsync(List<AttendanceDto> dtos);
}
