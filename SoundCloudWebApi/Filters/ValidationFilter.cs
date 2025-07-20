using FluentValidation;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;

namespace SoundCloudWebApi.Filters;

public class ValidationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var argument in context.ActionArguments.Values)
        {
            if (argument == null) continue;

            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType());
            var validator = context.HttpContext.RequestServices.GetService(validatorType);

            if (validator is not null)
            {
                var validateMethod = validatorType.GetMethod("ValidateAsync", new[] { argument.GetType(), typeof(CancellationToken) });
                if (validateMethod != null)
                {
                    var task = (Task)validateMethod.Invoke(validator, new object[] { argument, CancellationToken.None })!;
                    await task.ConfigureAwait(false);

                    var resultProperty = task.GetType().GetProperty("Result");
                    var validationResult = resultProperty?.GetValue(task);

                    var isValidProp = validationResult?.GetType().GetProperty("IsValid")?.GetValue(validationResult);
                    if (isValidProp is false)
                    {
                        var errors = (IEnumerable<FluentValidation.Results.ValidationFailure>)
                            validationResult?.GetType().GetProperty("Errors")?.GetValue(validationResult)!;

                        var errorDict = errors
                            .GroupBy(e => e.PropertyName)
                            .ToDictionary(
                                g => g.Key,
                                g => g.Select(e => e.ErrorMessage).ToArray()
                            );

                        context.Result = new BadRequestObjectResult(new
                        {
                            //type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
                            //title = "One or more validation errors occurred.",
                            status = 400,
                            isValid = false,
                            errors = errorDict,
                            //traceId = context.HttpContext.TraceIdentifier
                        });

                        return;
                    }
                }
            }
        }

        await next();
    }
}

