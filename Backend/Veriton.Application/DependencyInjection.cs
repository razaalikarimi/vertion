using Microsoft.Extensions.DependencyInjection;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Services;
using Veriton.Application.Services;

namespace Veriton.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // School Service
        services.AddScoped<IGenericService<SchoolCreateDto, SchoolUpdateDto, SchoolDto>, GenericSchoolService>();

        // Grade Service
        services.AddScoped<IGenericService<GradeCreateDto, GradeUpdateDto, GradeDto>, GradeService>();

        // Teacher Service
        services.AddScoped<IGenericService<TeacherCreateDto, TeacherUpdateDto, TeacherDto>, TeacherService>();

        // Student Service
        services.AddScoped<IGenericService<StudentCreateDto, StudentUpdateDto, StudentDto>, StudentService>();

        // Module (Subject) Service
        services.AddScoped<IGenericService<ModuleCreateDto, ModuleUpdateDto, ModuleDto>, ModuleService>();

        // Lesson Service
        services.AddScoped<ILessonService, LessonService>();
        services.AddScoped<IGenericService<LessonCreateDto, LessonUpdateDto, LessonDto>>(sp => sp.GetRequiredService<ILessonService>());

        // Scheduler Service
        services.AddScoped<IGenericService<SchedulerCreateDto, SchedulerUpdateDto, SchedulerDto>, SchedulerService>();

        // Exam Service
        services.AddScoped<IGenericService<ExamCreateDto, ExamUpdateDto, ExamDto>, ExamService>();

        // Question Service
        services.AddScoped<IGenericService<QuestionCreateDto, QuestionUpdateDto, QuestionDto>, QuestionService>();

        // Dashboard Stats Service
        services.AddScoped<IDashboardService, DashboardService>();

        // Result Service
        services.AddScoped<IGenericService<ResultCreateDto, ResultUpdateDto, ResultDto>, ResultService>();

        // Attendance Service
        services.AddScoped<IAttendanceService, AttendanceService>();

        return services;
    }
}
