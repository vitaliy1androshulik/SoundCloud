using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;    // ← для OpenApiSecurityScheme
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Filters;
using SoundCloudWebApi.Services;
using SoundCloudWebApi.Services.Interfaces;
using SoundCloudWebApi.Validators.Auth;
using Swashbuckle.AspNetCore.Annotations;
using System.Text;
using SoundCloudWebApi.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Program.cs, одразу після CreateBuilder:
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Add services to the container.
builder.Services.AddDbContext<SoundCloudDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();

// JWT.
var jwtSection = builder.Configuration.GetSection("Jwt");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
                                      Encoding.UTF8.GetBytes(jwtSection["Key"])),
        ValidateIssuer = true,
        ValidIssuer = jwtSection["SoundCloudWebApi"],
        ValidateAudience = true,
        ValidAudience = jwtSection["SoundCloudWebApi"],
        ValidateLifetime = true,
        //ClockSkew = TimeSpan.Zero
        ClockSkew = TimeSpan.FromMinutes(5)
    };
});

// 1б) Налаштування CORS — ім’я політики "AllowAll"
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", p =>
    {
        p
         .AllowAnyOrigin()
         .AllowAnyMethod()
         .AllowAnyHeader();
    });
});

// 2) Додаємо контролери та фільтр
builder.Services
    .AddControllers(options =>
    {
        options.Filters.Add<ValidationFilter>();
    });

// 3) Реєструємо всі валідатори в DI
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

// 4) Підключаємо FluentValidation у пайплайн моделі (авто-валід + client-side адаптери)
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();

// 5) Swagger / OpenAPI
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SoundCloud API", Version = "v1" });

    // дозволяє читати атрибути [SwaggerOperation], [SwaggerResponse], тощо
    c.EnableAnnotations();

    // Описуємо схему Bearer
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Введіть у поле: Bearer {твій токен}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    // Вимагаємо цю схему для всіх захищених методів
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

});

// Вимикаємо автоматичну валідацію через ModelState
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseGlobalErrorHandler();

app.UseCors("AllowAll");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
