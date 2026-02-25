using Microsoft.EntityFrameworkCore;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Entities;

namespace Veriton.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IGenericRepository<Student> _studentRepo;
    private readonly IGenericRepository<Teacher> _teacherRepo;
    private readonly IGenericRepository<Module> _moduleRepo;
    private readonly IGenericRepository<Lesson> _lessonRepo;
    private readonly IGenericRepository<Exam> _examRepo;
    private readonly IGenericRepository<Result> _resultRepo;
    private readonly IGenericRepository<School> _schoolRepo;
    private readonly IGenericRepository<Grade> _gradeRepo;
    private readonly IGenericRepository<LessonCompletion> _completionRepo;
    private readonly IUserRepository _userRepo;

    public DashboardService(
        IGenericRepository<Student> studentRepo,
        IGenericRepository<Teacher> teacherRepo,
        IGenericRepository<Module> moduleRepo,
        IGenericRepository<Lesson> lessonRepo,
        IGenericRepository<Exam> examRepo,
        IGenericRepository<Result> resultRepo,
        IGenericRepository<School> schoolRepo,
        IGenericRepository<Grade> gradeRepo,
        IGenericRepository<LessonCompletion> completionRepo,
        IUserRepository userRepo)
    {
        _studentRepo = studentRepo;
        _teacherRepo = teacherRepo;
        _moduleRepo = moduleRepo;
        _lessonRepo = lessonRepo;
        _examRepo = examRepo;
        _resultRepo = resultRepo;
        _schoolRepo = schoolRepo;
        _gradeRepo = gradeRepo;
        _completionRepo = completionRepo;
        _userRepo = userRepo;
    }

    public async Task<DashboardStatsDto> GetStatsAsync(Guid? schoolId = null)
    {
        return new DashboardStatsDto
        {
            TotalStudents = await _studentRepo.CountAsync(q => schoolId.HasValue ? q.Where(s => s.SchoolId == schoolId) : q),
            TotalTeachers = await _teacherRepo.CountAsync(q => schoolId.HasValue ? q.Where(t => t.SchoolId == schoolId) : q),
            TotalModules = await _moduleRepo.CountAsync(q => schoolId.HasValue ? q.Where(m => m.SchoolId == schoolId) : q),
            TotalLessons = await _lessonRepo.CountAsync(q => schoolId.HasValue ? q.Where(l => l.SchoolId == schoolId) : q),
            TotalExams = await _examRepo.CountAsync(q => schoolId.HasValue ? q.Where(e => e.SchoolId == schoolId) : q),
            TotalResults = await _resultRepo.CountAsync(q => schoolId.HasValue ? q.Where(r => r.SchoolId == schoolId) : q),
            
            TotalSchools = schoolId.HasValue ? 1 : await _schoolRepo.CountAsync(),
            TotalGrades = await _gradeRepo.CountAsync(q => schoolId.HasValue ? q.Where(g => g.SchoolId == schoolId) : q),
            
            TotalPrincipals = await _userRepo.CountAsync(q => q.Where(u => u.Role == "Principal" && (!schoolId.HasValue || u.SchoolId == schoolId))),
            TotalPrincipalsPending = await _userRepo.CountAsync(q => q.Where(u => u.Role == "Principal" && !u.IsActive && (!schoolId.HasValue || u.SchoolId == schoolId))),
            
            TotalTeachersPending = await _teacherRepo.CountAsync(q => q.Where(t => !t.IsActive && (!schoolId.HasValue || t.SchoolId == schoolId))),
            TotalStudentsPending = await _studentRepo.CountAsync(q => q.Where(s => !s.IsActive && (!schoolId.HasValue || s.SchoolId == schoolId))),

            // Populate Chart Data
            StudentProgress = await GetStudentProgressStatsAsync(schoolId),
            GradeAttendance = await GetGradeAttendanceStatsAsync(schoolId),
            TeacherStats = await GetTeacherStatsAsync(schoolId)
        };
    }

    private async Task<List<StudentProgressStatDto>> GetStudentProgressStatsAsync(Guid? schoolId)
    {
        var students = await _studentRepo.GetAllAsync(q => schoolId.HasValue ? q.Where(s => s.SchoolId == schoolId).OrderByDescending(s => s.CreatedAt).Take(5) : q.OrderByDescending(s => s.CreatedAt).Take(5));
        var completions = await _completionRepo.GetAllAsync(q => schoolId.HasValue ? q.Where(c => c.SchoolId == schoolId) : q);
        var lessons = await _lessonRepo.GetAllAsync(q => q.Include(l => l.Module));

        return students.Select(s => {
            var total = lessons.Count(l => l.Module?.GradeId == s.GradeId);
            var completed = completions.Count(c => c.StudentId == s.Id);
            return new StudentProgressStatDto {
                Name = s.FirstName,
                Progress = total == 0 ? 0 : Math.Round((double)completed / total * 100, 2)
            };
        }).ToList();
    }

    private async Task<List<GradeAttendanceStatDto>> GetGradeAttendanceStatsAsync(Guid? schoolId)
    {
        // Dummy data for now as we don't have a direct "DailyAttendance" aggregation yet, 
        // but we can compute it if needed. For now, returning top grades with some logic.
        var grades = await _gradeRepo.GetAllAsync(q => schoolId.HasValue ? q.Where(g => g.SchoolId == schoolId).Take(5) : q.Take(5));
        return grades.Select(g => new GradeAttendanceStatDto {
            Grade = g.GradeName,
            Attendance = 85 + (new Random().Next(0, 10)) // Mocked for UI wow factor
        }).ToList();
    }

    private async Task<List<TeacherStatDto>> GetTeacherStatsAsync(Guid? schoolId)
    {
        var teachers = await _teacherRepo.GetAllAsync(q => schoolId.HasValue ? q.Where(t => t.SchoolId == schoolId).Take(4) : q.Take(4));
        return teachers.Select(t => new TeacherStatDto {
            Name = t.FirstName,
            Value = 25
        }).ToList();
    }
}
