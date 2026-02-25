using Microsoft.EntityFrameworkCore;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Domain.Entities;
using Veriton.Infrastructure.Persistence.DbContext;

namespace Veriton.Infrastructure.Repositories;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet
            .Include(u => u.TeacherProfile)
            .Include(u => u.StudentProfile)
            .FirstOrDefaultAsync(x => x.Email == email && x.IsActive);
    }
}

