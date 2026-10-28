import * as THREE from 'three'

// What the laptop "types" on its screen.
const SOURCE = `var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>();
builder.Services.AddScoped<IListingService, ListingService>();
builder.Services.AddGraphQLServer()
    .AddQueryType<ListingQueries>()
    .AddFiltering()
    .AddSorting();

var app = builder.Build();

app.MapGet("/api/listings/{id}", async (int id, IListingService svc) =>
    await svc.GetAsync(id) is { } listing
        ? Results.Ok(listing)
        : Results.NotFound());

app.MapGraphQL();
app.Run();`

const KEYWORDS = new Set(['var', 'async', 'await', 'is', 'int', 'new', 'return', 'public', 'class'])

const COLORS = {
  bg: '#0e0e14',
  bar: '#16161f',
  gutter: '#4b4b5c',
  text: '#d4d4dc',
  keyword: '#a79dff',
  type: '#4ec9b0',
  method: '#dcdcaa',
  string: '#ce9178',
  punct: '#8b8b9a',
  cursor: '#a79dff',
}

type Token = { text: string; color: string }

function tokenize(line: string): Token[] {
  const tokens: Token[] = []
  const re = /("[^"]*")|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|(.)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(line))) {
    const [text, str, word] = m
    let color = COLORS.punct
    if (str) color = COLORS.string
    else if (word) {
      const next = line[re.lastIndex]
      if (KEYWORDS.has(word)) color = COLORS.keyword
      else if (next === '(' || next === '<') color = /^[A-Z]/.test(word) && next === '<' ? COLORS.type : COLORS.method
      else if (/^[A-Z]/.test(word)) color = COLORS.type
      else color = COLORS.text
    } else if (/\s/.test(text)) color = COLORS.text
    tokens.push({ text, color })
  }
  return tokens
}

const LINES = SOURCE.split('\n').map(tokenize)
export const TOTAL_CHARS = SOURCE.replace(/\n/g, '').length

const W = 1024
const H = 640

export function createCodeScreen() {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4

  let lastKey = ''
  // Redraw once the web font is ready, otherwise the first frames use a fallback font.
  document.fonts?.ready.then(() => {
    lastKey = ''
  })

  /** Draws the editor with `visible` characters typed. Cheap no-op if nothing changed. */
  function draw(visible: number, cursorOn: boolean) {
    const key = `${visible}|${cursorOn}`
    if (key === lastKey) return
    lastKey = key

    ctx.fillStyle = COLORS.bg
    ctx.fillRect(0, 0, W, H)

    // Title bar
    ctx.fillStyle = COLORS.bar
    ctx.fillRect(0, 0, W, 52)
    ;['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.arc(30 + i * 26, 26, 8, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.fillStyle = '#9b9bab'
    ctx.font = '500 22px "JetBrains Mono", monospace'
    ctx.fillText('Program.cs', 128, 34)

    const lineH = 28
    const top = 92
    ctx.font = '20px "JetBrains Mono", monospace'
    let remaining = visible
    let cursor: { x: number; y: number } | null = null

    for (let i = 0; i < LINES.length; i++) {
      const tokens = LINES[i]
      const y = top + i * lineH
      ctx.fillStyle = COLORS.gutter
      ctx.textAlign = 'right'
      ctx.fillText(String(i + 1), 50, y)
      ctx.textAlign = 'left'
      if (cursor) continue

      let x = 80
      for (const t of tokens) {
        if (remaining <= 0) break
        const part = t.text.slice(0, remaining)
        remaining -= part.length
        ctx.fillStyle = t.color
        ctx.fillText(part, x, y)
        x += ctx.measureText(part).width
      }
      if (remaining <= 0) cursor = { x, y }
    }

    if (cursorOn && cursor) {
      ctx.fillStyle = COLORS.cursor
      ctx.fillRect(cursor.x + 2, cursor.y - 20, 3, 25)
    }
    texture.needsUpdate = true
  }

  return { texture, draw, dispose: () => texture.dispose() }
}
