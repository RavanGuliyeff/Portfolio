export interface Snippet {
  lang: 'C#' | 'SQL'
  title: string
  code: string
}

export const SNIPPETS: Snippet[] = [
  {
    lang: 'C#',
    title: 'Repository method',
    code: `public async Task<Listing?> GetAsync(int id)
{
    return await _db.Listings.FindAsync(id);
}`,
  },
  {
    lang: 'C#',
    title: 'LINQ query',
    code: `var active = listings
    .Where(l => l.IsActive && l.Price < 150000)
    .OrderByDescending(l => l.CreatedAt)
    .Take(20);`,
  },
  {
    lang: 'SQL',
    title: 'Aggregation',
    code: `SELECT city, COUNT(*) AS total
FROM listings
WHERE status = 'active'
GROUP BY city
ORDER BY total DESC;`,
  },
  {
    lang: 'C#',
    title: 'Dependency injection',
    code: `builder.Services.AddScoped<IListingService, ListingService>();
builder.Services.AddMemoryCache();`,
  },
  {
    lang: 'C#',
    title: 'Hangfire job',
    code: `RecurringJob.AddOrUpdate<ListingCleanupJob>(
    "expire-listings",
    job => job.RunAsync(),
    Cron.Daily);`,
  },
  {
    lang: 'C#',
    title: 'CQRS command',
    code: `public record CreateListingCommand(string Title, decimal Price)
    : IRequest<int>;`,
  },
  {
    lang: 'C#',
    title: 'Minimal API',
    code: `app.MapGet("/api/listings/{id}", async (int id, IListingService svc) =>
    await svc.GetAsync(id) is { } listing
        ? Results.Ok(listing)
        : Results.NotFound());`,
  },
  {
    lang: 'C#',
    title: 'Dapper query',
    code: `using var connection = new NpgsqlConnection(connectionString);
var rows = await connection.QueryAsync<Listing>(sql, new { city });`,
  },
  {
    lang: 'C#',
    title: 'Unit of Work',
    code: `public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}`,
  },
  {
    lang: 'SQL',
    title: 'Join',
    code: `SELECT u.email, COUNT(l.id) AS listings
FROM users u
LEFT JOIN listings l ON l.owner_id = u.id
GROUP BY u.email;`,
  },
  {
    lang: 'C#',
    title: 'Guard clause',
    code: `if (request.Price <= 0)
    throw new ValidationException("Price must be positive.");`,
  },
  {
    lang: 'C#',
    title: 'EF Core configuration',
    code: `builder.Entity<Listing>()
    .HasIndex(l => new { l.City, l.CreatedAt });`,
  },
]
