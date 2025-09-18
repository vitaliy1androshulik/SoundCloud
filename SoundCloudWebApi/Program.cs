using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Filters;
using SoundCloudWebApi.Validators.Auth;
using SoundCloudWebApi.Services;
using SoundCloudWebApi.Services.Interfaces;
using SoundCloudWebApi.Models.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Threading.Tasks;
using SoundCloudWebApi.Middleware;
using Swashbuckle.AspNetCore.Annotations;
using SoundCloudWebApi.Services.Implementations;
using SoundCloudWebApi.Options;
using SoundCloudWebApi.Services.Abstractions;


var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();


// Add services to the container.
builder.Services.AddDbContext<SoundCloudDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.Configure<GoogleAuthOptions>(
    builder.Configuration.GetSection("GoogleAuth"));

builder.Services.AddTransient<IGoogleTokenValidator, GoogleTokenValidator>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>(); 

builder.Services.AddScoped<ICategoryService, CategoryService>();

// Нові сервіси для медіа-контенту
builder.Services.AddScoped<IPlaylistService, PlaylistService>();
builder.Services.AddScoped<IAlbumService, AlbumService>();
builder.Services.AddScoped<ITrackService, TrackService>();
builder.Services.AddScoped<IImageStorage, FileSystemImageStorage>();
builder.Services.AddScoped<IGenreService, GenreService>();

builder.Services.AddScoped<ISearchService, SearchService>();

builder.Services.AddHttpContextAccessor();


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
        ValidIssuer = jwtSection["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSection["Audience"],
        ValidateLifetime = true,
        //ClockSkew = TimeSpan.Zero
        ClockSkew = TimeSpan.FromMinutes(60)
    };

    //нове для тестування -----------
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = ctx =>
        {
            Console.WriteLine("[JWT] Failed: " + ctx.Exception.Message);
            return Task.CompletedTask;
        },
        OnChallenge = ctx =>
        {
            Console.WriteLine("[JWT] Challenge: " + ctx.ErrorDescription);
            return Task.CompletedTask;
        },
        OnMessageReceived = ctx =>
        {
            Console.WriteLine("[JWT] Authorization = " + ctx.Request.Headers["Authorization"].ToString());
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

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
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidationFilter>();
});

// 3) Реєструємо валідатори у DI
//builder.Services.AddValidatorsFromAssemblies(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

//builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SoundCloud API", Version = "v1" });

    // дозволяє читати атрибути [SwaggerOperation], [SwaggerResponse], тощо
    c.EnableAnnotations();

    // Описуємо схему Bearer
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Вставте ЛИШЕ JWT (без 'Bearer ')",
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

//app.UseHttpsRedirection();

app.UseStaticFiles();          // віддаємо /uploads/** з wwwroot/uploads

app.UseCors("AllowAll");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
