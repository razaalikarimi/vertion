using Veriton.Domain.Common;
using Veriton.Domain.Entities;
using Veriton.Infrastructure.Persistence.DbContext;

namespace Veriton.Infrastructure.Persistence.Seed;

public static class AdminSeeder
{
    public static void Seed(AppDbContext context)
    {
        // 1. Seed or Retrieve Default School
        if (!context.Schools.Any())
        {
            var school = new School
            {
                Id = Guid.NewGuid(),
                SchoolCode = "VER-001",
                Name = "Veriton International School",
                IsActive = true
            };
            context.Schools.Add(school);
            context.SaveChanges();
            Console.WriteLine("✅ Default School created: Veriton International School");
        }
        var defaultSchool = context.Schools.First();

        // 2. Super Admin
        SeedUser(context, "superadmin@veriton.com", "SuperAdmin@123", AppRoles.SuperAdmin, "Super", "Admin");

        // 3. Admin Users (2 users)
        SeedUser(context, "admin1@veriton.com", "Admin12", AppRoles.Admin, "Admin", "One", defaultSchool.Id);
        SeedUser(context, "admin2@veriton.com", "Admin12", AppRoles.Admin, "Admin", "Two", defaultSchool.Id);

        // 4. Staff Users (2 users)
        SeedUser(context, "staff1@veriton.com", "Staff12", AppRoles.Staff, "Staff", "One", defaultSchool.Id);
        SeedUser(context, "staff2@veriton.com", "Staff12", AppRoles.Staff, "Staff", "Two", defaultSchool.Id);

        // 5. Principal Users (2 users)
        SeedUser(context, "principal1@veriton.com", "Principal12", AppRoles.Principal, "Principal", "One", defaultSchool.Id);
        SeedUser(context, "principal2@veriton.com", "Principal12", AppRoles.Principal, "Principal", "Two", defaultSchool.Id);

        // 6. Seed Default Grades (Required for Students)
        if (!context.Grades.Any())
        {
            var grades = new List<Grade>
            {
                new Grade { Id = Guid.NewGuid(), SchoolId = defaultSchool.Id, GradeLevel = "10", Section = "A", GradeName = "Grade 10 - A", IsActive = true },
                new Grade { Id = Guid.NewGuid(), SchoolId = defaultSchool.Id, GradeLevel = "11", Section = "A", GradeName = "Grade 11 - A", IsActive = true },
                new Grade { Id = Guid.NewGuid(), SchoolId = defaultSchool.Id, GradeLevel = "12", Section = "A", GradeName = "Grade 12 - A", IsActive = true }
            };
            context.Grades.AddRange(grades);
            context.SaveChanges();
            Console.WriteLine("✅ Default Grades created");
        }
        var defaultGrade = context.Grades.First();

        // 7. Teacher Users (2 users)
        SeedTeacher(context, "teacher1@veriton.com", "Teacher12", "TEACH-001", "Teacher", "One", defaultSchool.Id);
        SeedTeacher(context, "teacher2@veriton.com", "Teacher12", "TEACH-002", "Teacher", "Two", defaultSchool.Id);
        var defaultTeacher = context.Teachers.First();

        // 8. Student Users (2 users)
        SeedStudent(context, "student1@veriton.com", "Student12", "STUD-001", "Student", "One", defaultSchool.Id, defaultGrade.Id);
        SeedStudent(context, "student2@veriton.com", "Student12", "STUD-002", "Student", "Two", defaultSchool.Id, defaultGrade.Id);

        // 9. Seed Sample Modules & Lessons (For Student Dashboard Demo)
        var sampleModule = context.Modules.FirstOrDefault(m => m.Name == "Robotics & Smart Systems");
        if (sampleModule == null)
        {
            sampleModule = new Module
            {
                Id = Guid.NewGuid(),
                SchoolId = defaultSchool.Id,
                GradeId = defaultGrade.Id,
                Name = "Robotics & Smart Systems",
                Description = "A comprehensive guide to Robotics and IoT using Arduino.",
                Credits = 5,
                CreatedByTeacherId = defaultTeacher.Id,
                IsActive = true
            };
            context.Modules.Add(sampleModule);
            context.SaveChanges();
            Console.WriteLine("✅ Sample Module Seeded");
        }

        if (!context.Lessons.Any(l => l.ModuleId == sampleModule.Id))
        {
            var lessons = new List<Lesson>
            {
                new Lesson
                {
                    Id = Guid.NewGuid(),
                    SchoolId = defaultSchool.Id,
                    ModuleId = sampleModule.Id,
                    SubTopic = "Introduction to Arduino IDE",
                    Activity = "Learn how to setup the Arduino IDE and connect your first board.",
                    VideoUrl = "https://www.youtube.com/watch?v=nL34zDTPkJK",
                    DiagramUrl = "https://www.arduino.cc/en/uploads/Main/ArduinoUno_R3_Front.jpg",
                    Code = "void setup() {\n  // initialize digital pin LED_BUILTIN as an output.\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);   // turn the LED on (HIGH is the voltage level)\n  delay(1000);                       // wait for a second\n  digitalWrite(LED_BUILTIN, LOW);    // turn the LED off by making the voltage LOW\n  delay(1000);                       // wait for a second\n}",
                    Procedure = "1. Install Arduino IDE\n2. Plug in Arduino Uno\n3. Select Board and Port\n4. Write Code\n5. Upload",
                    RequiredMaterial = "1. Arduino Uno\n2. USB Cable\n3. Laptop with Arduino IDE",
                    WhatYouGet = "Basic understanding of microcontrollers and blinking LED logic.",
                    CreatedByTeacherId = defaultTeacher.Id
                },
                new Lesson
                {
                    Id = Guid.NewGuid(),
                    SchoolId = defaultSchool.Id,
                    ModuleId = sampleModule.Id,
                    SubTopic = "Sensors and Variables",
                    Activity = "Connecting an Ultrasonic sensor to measure distance.",
                    VideoUrl = "https://www.youtube.com/watch?v=ZEjQOT6vEOU",
                    Code = "// Ultrasonic Sensor Pin Configuration\nconst int trigPin = 9;\nconst int echoPin = 10;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(trigPin, OUTPUT);\n  pinMode(echoPin, INPUT);\n}",
                    Procedure = "1. Connect VCC to 5V\n2. Connect GND to GND\n3. Connect Trig to Pin 9\n4. Connect Echo to Pin 10",
                    RequiredMaterial = "1. HC-SR04 Ultrasonic Sensor\n2. Jumper Wires",
                    WhatYouGet = "Ability to measure distance using sound waves.",
                    CreatedByTeacherId = defaultTeacher.Id
                }
            };
            context.Lessons.AddRange(lessons);
            context.SaveChanges();
            Console.WriteLine("✅ Sample Lessons Seeded");
        }

        context.SaveChanges();
    }

    private static void SeedUser(AppDbContext context, string email, string password, string role, string firstName, string lastName, Guid? schoolId = null)
    {
        if (!context.Users.Any(u => u.Email == email))
        {
            var user = new User(
                email: email,
                passwordHash: BCrypt.Net.BCrypt.HashPassword(password),
                role: role,
                schoolId: schoolId
            );
            user.FirstName = firstName;
            user.LastName = lastName;
            context.Users.Add(user);
            Console.WriteLine($"✅ User Seeded: {email} / {password} [{role}]");
        }
    }

    private static void SeedTeacher(AppDbContext context, string email, string password, string employeeId, string firstName, string lastName, Guid schoolId)
    {
        if (!context.Users.Any(u => u.Email == email))
        {
            var user = new User(
                email: email,
                passwordHash: BCrypt.Net.BCrypt.HashPassword(password),
                role: AppRoles.Teacher,
                schoolId: schoolId
            );
            user.FirstName = firstName;
            user.LastName = lastName;
            context.Users.Add(user);

            var teacher = new Teacher
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                SchoolId = schoolId,
                EmployeeId = employeeId,
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                IsActive = true
            };
            context.Teachers.Add(teacher);
            Console.WriteLine($"✅ Teacher Seeded: {email} / {password}");
        }
    }

    private static void SeedStudent(AppDbContext context, string email, string password, string studentId, string firstName, string lastName, Guid schoolId, Guid gradeId)
    {
        if (!context.Users.Any(u => u.Email == email))
        {
            var user = new User(
                email: email,
                passwordHash: BCrypt.Net.BCrypt.HashPassword(password),
                role: AppRoles.Student,
                schoolId: schoolId
            );
            user.FirstName = firstName;
            user.LastName = lastName;
            context.Users.Add(user);

            var student = new Student
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                SchoolId = schoolId,
                GradeId = gradeId,
                StudentId = studentId,
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                IsActive = true
            };
            context.Students.Add(student);
            Console.WriteLine($"✅ Student Seeded: {email} / {password}");
        }
    }
}

