using FluentValidation;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using FluentValidation.Results;
using System.Linq;                 
using System.Collections.Generic;  


namespace SoundCloudWebApi.Filters;

public class ValidationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        // агрегуємо всі помилки по всіх аргументах і не використовуємо рефлексію
        //Дістаємо ServiceProvider один раз (не в кожній ітерації)
        var sp = context.HttpContext.RequestServices;
        // збираємо помилки по всіх аргументах екшену, Ключ — назва властивості моделі, значення — список повідомлень
        var aggregatedErrors = new Dictionary<string, List<string>>();
                
        foreach (var argument in context.ActionArguments.Values) // Обходимо всі аргументи екшена
        {
            if (argument == null) continue;// Пропускаємо null-аргументи

            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType()); // Як і було: шукаємо IValidator<T> для фактичного типу аргументу
            var validatorObj = sp.GetService(validatorType);// Отримуємо валідатор з DI — але НЕ будемо викликати його через рефлексію.Замість цього безпечно приведемо до IValidator і використаємо ValidationContext<object>.
            //if (validatorObj is null) continue;
            ////var validator = context.HttpContext.RequestServices.GetService(validatorType);

            //var validator = (IValidator)validatorObj; //

            //// гарантовано працює на будь-якій версії FluentValidation
            //ValidationResult result = await validator.ValidateAsync(new ValidationContext<object>(argument));

            if (validatorObj is not null)
            {
                var validator = (IValidator)validatorObj; // Безпечний шлях (працює на будь-якій версії FluentValidation)

                // гарантовано працює на будь-якій версії FluentValidation
                ValidationResult result = await validator.ValidateAsync(new ValidationContext<object>(argument));

                // Якщо є помилки — складаємо їх у загальний словник
                if (!result.IsValid)
                {
                    foreach (var failure in result.Errors)
                    {
                        // Ключ — PropertyName, значення — список повідомлень для цієї властивості
                        if (!aggregatedErrors.TryGetValue(failure.PropertyName, out var list))
                        {
                            list = new List<string>();
                            aggregatedErrors[failure.PropertyName] = list;
                        }
                        list.Add(failure.ErrorMessage);
                    }
                }


                //var validateMethod = validatorType.GetMethod("ValidateAsync", new[] { argument.GetType(), typeof(CancellationToken) });
                //if (validateMethod != null)
                //{
                //    var task = (Task)validateMethod.Invoke(validator, new object[] { argument, CancellationToken.None })!;
                //    await task.ConfigureAwait(false);

                //    var resultProperty = task.GetType().GetProperty("Result");
                //    var validationResult = resultProperty?.GetValue(task);

                //    var isValidProp = validationResult?.GetType().GetProperty("IsValid")?.GetValue(validationResult);
                //    if (isValidProp is false)
                //    {
                //        var errors = (IEnumerable<FluentValidation.Results.ValidationFailure>)
                //            validationResult?.GetType().GetProperty("Errors")?.GetValue(validationResult)!;

                //        var errorDict = errors
                //            .GroupBy(e => e.PropertyName)
                //            .ToDictionary(
                //                g => g.Key,
                //                g => g.Select(e => e.ErrorMessage).ToArray()
                //            );

                //        context.Result = new BadRequestObjectResult(new
                //        {
                //            //type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
                //            //title = "One or more validation errors occurred.",
                //            status = 400,
                //            isValid = false,
                //            errors = errorDict,
                //            //traceId = context.HttpContext.TraceIdentifier
                //        });

                //        return;
                //    }
                //}

            }
        }

        // Раніше: повертали 400 одразу після першої невалідної моделі.
        // Тепер: перевірили ВСІ аргументи і, якщо є помилки — віддаємо 400 з усім переліком.
        if (aggregatedErrors.Count > 0)
        {
            //  Формуємо той самий формат, що й був : string -> string[]
            var errorDict = aggregatedErrors.ToDictionary(kv => kv.Key, kv => kv.Value.ToArray());

            // Повертаємо 400 у вигляді такого ж об’єкта (фронт = те саме)
            context.Result = new BadRequestObjectResult(new
            {
                //type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
                //title = "One or more validation errors occurred.",
                status = 400,
                isValid = false,
                errors = errorDict,
                //traceId = context.HttpContext.TraceIdentifier
            });

            return; // зупиняємо конвеєр
        }

        await next(); // Якщо помилок немає — пускаємо далі
    }
}

