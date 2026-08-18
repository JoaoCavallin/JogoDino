var builder = WebApplication.CreateBuilder(args);

// Serviços
builder.Services.AddRazorPages();
builder.Services.AddControllers();

// Armazena o recorde em memória (troque por banco de dados se quiser persistência real)
builder.Services.AddSingleton<DinoGame.Services.ScoreStore>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapRazorPages();
app.MapControllers();

app.Run();
