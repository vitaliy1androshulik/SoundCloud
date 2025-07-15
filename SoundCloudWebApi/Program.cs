ï»¿using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;    // â Ð´Ð»Ñ OpenApiSecurityScheme
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Filters;
using SoundCloudWebApi.Services;
using SoundCloudWebApi.Services.Interfaces;
using SoundCloudWebApi.Validators.Auth;
using Swashbuckle.AspNetCore.Annotations;
using System.Text;
using SoundCloudWebApi.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Program.cs, Ð¾Ð´ÑÐ°Ð·Ñ Ð¿ÑÑÐ»Ñ CreateBuilder:
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

// 1Ð±) ÐÐ°Ð»Ð°ÑÑÑÐ²Ð°Ð½Ð½Ñ CORS â ÑÐ¼âÑ Ð¿Ð¾Ð»ÑÑÐ¸ÐºÐ¸ "AllowAll"
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

// 2) ÐÐ¾Ð´Ð°ÑÐ¼Ð¾ ÐºÐ¾Ð½ÑÑÐ¾Ð»ÐµÑÐ¸ ÑÐ° ÑÑÐ»ÑÑÑ
builder.Services
    .AddControllers(options =>
    {
        options.Filters.Add<ValidationFilter>();
    });

// 3) Ð ÐµÑÑÑÑÑÑÐ¼Ð¾ Ð²ÑÑ Ð²Ð°Ð»ÑÐ´Ð°ÑÐ¾ÑÐ¸ Ð² DI
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

// 4) ÐÑÐ´ÐºÐ»ÑÑÐ°ÑÐ¼Ð¾ FluentValidation Ñ Ð¿Ð°Ð¹Ð¿Ð»Ð°Ð¹Ð½ Ð¼Ð¾Ð´ÐµÐ»Ñ (Ð°Ð²ÑÐ¾-Ð²Ð°Ð»ÑÐ´ + client-side Ð°Ð´Ð°Ð¿ÑÐµÑÐ¸)

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidationFilter>();
});

// 2) Ðåºñòðóºìî âàë³äàòîðè ó DI
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

// 3) Ï³äêëþ÷àºìî FluentValidation ó ïàéïëàéí (àâòî-âàë³ä + client-side àäàïòåðè)

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();

// 5) Swagger / OpenAPI
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SoundCloud API", Version = "v1" });

    // Ð´Ð¾Ð·Ð²Ð¾Ð»ÑÑ ÑÐ¸ÑÐ°ÑÐ¸ Ð°ÑÑÐ¸Ð±ÑÑÐ¸ [SwaggerOperation], [SwaggerResponse], ÑÐ¾ÑÐ¾
    c.EnableAnnotations();

    // ÐÐ¿Ð¸ÑÑÑÐ¼Ð¾ ÑÑÐµÐ¼Ñ Bearer
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "ÐÐ²ÐµÐ´ÑÑÑ Ñ Ð¿Ð¾Ð»Ðµ: Bearer {ÑÐ²ÑÐ¹ ÑÐ¾ÐºÐµÐ½}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    // ÐÐ¸Ð¼Ð°Ð³Ð°ÑÐ¼Ð¾ ÑÑ ÑÑÐµÐ¼Ñ Ð´Ð»Ñ Ð²ÑÑÑ Ð·Ð°ÑÐ¸ÑÐµÐ½Ð¸Ñ Ð¼ÐµÑÐ¾Ð´ÑÐ²
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
