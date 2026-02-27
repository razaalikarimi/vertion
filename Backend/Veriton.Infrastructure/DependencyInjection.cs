using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Security;
using Veriton.Infrastructure.Persistence.DbContext;
using Veriton.Infrastructure.Repositories;
using Veriton.Infrastructure.Security;

namespace Veriton.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Try to get Railway's MYSQL_URL first
        var mySqlUrl = Environment.GetEnvironmentVariable("MYSQL_URL");
        var connectionString = configuration.GetConnectionString("MySql");

        if (!string.IsNullOrEmpty(mySqlUrl) && mySqlUrl.StartsWith("mysql://"))
        {
            // Parse mysql://user:password@host:port/database
            var uri = new Uri(mySqlUrl);
            var userInfo = uri.UserInfo.Split(':');
            var db = uri.AbsolutePath.TrimStart('/');
            connectionString = $"Server={uri.Host};Port={(uri.Port > 0 ? uri.Port : 3306)};Database={db};User={userInfo[0]};Password={(userInfo.Length > 1 ? userInfo[1] : "")};";
        }
        
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("MySql connection string not found. Please set ConnectionStrings__MySql or MYSQL_URL environment variable.");
        }


        services.AddDbContext<AppDbContext>(options =>
            options.UseMySql(
                connectionString,
                ServerVersion.AutoDetect(connectionString)));

        // Security Services
        services.AddHttpContextAccessor();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        // Repositories
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IUserRepository, UserRepository>();

        return services;
    }
}
