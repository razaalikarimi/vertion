namespace Veriton.Application.DTOs;

public class ResultDto
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = "";
    public Guid ExamId { get; set; }
    public string ExamTitle { get; set; } = "";
    public decimal ObtainedMarks { get; set; }
    public decimal TotalMarks { get; set; }
    public string? Grade { get; set; }
    public string? Remarks { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ResultCreateDto
{
    public Guid StudentId { get; set; }
    public Guid ExamId { get; set; }
    public decimal ObtainedMarks { get; set; }
    public string? Grade { get; set; }
    public string? Remarks { get; set; }
    public bool IsPublished { get; set; }
}

public class ResultUpdateDto
{
    public decimal ObtainedMarks { get; set; }
    public string? Grade { get; set; }
    public string? Remarks { get; set; }
    public bool IsPublished { get; set; }
}
