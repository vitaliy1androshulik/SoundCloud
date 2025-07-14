using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Filters;
using FluentValidation.AspNetCore;
using SoundCloudWebApi.Validators.Auth;
using SoundCloudWebApi.Services;
using SoundCloudWebApi.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);


// Add services to the container.
builder.Services.AddDbContext<SoundCloudDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidationFilter>();
});

// 2) �������� ��������� � DI
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

// 3) ϳ�������� FluentValidation � �������� (����-���� + client-side ��������)
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// �������� ����������� �������� ����� ModelState
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

app.UseAuthorization();

app.MapControllers();

app.Run();
