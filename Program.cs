var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthorization();

app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/demos/cmccrewcard"))
    {
        context.Response.Headers.CacheControl = "no-store, no-cache, must-revalidate, max-age=0";
        context.Response.Headers.Pragma = "no-cache";
    }

    await next();
});

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapStaticAssets();
app.MapRazorPages()
   .WithStaticAssets();

app.MapFallbackToFile("/demos/stationdatahub/{*path:nonfile}", "demos/stationdatahub/index.html");
app.MapFallbackToFile("/demos/seatmap/{*path:nonfile}", "demos/seatmap/index.html");

app.Run();
