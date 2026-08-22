import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

export interface WorkEntry {
  title: string
  finishes: string[]
  image: string
  order: number
  caption: string
}

const WORK_DIR = join(process.cwd(), 'content', 'work')

/**
 * Reads content/work/*.md at build time. Frontmatter:
 *   title, finishes (comma list), image (path under /public), order (number)
 * Body text is the caption. An empty directory yields [] and the Work
 * section does not render at all.
 */
export function readWork(): WorkEntry[] {
  if (!existsSync(WORK_DIR)) return []
  const files = readdirSync(WORK_DIR).filter((f) => f.endsWith('.md'))
  const entries: WorkEntry[] = []
  for (const file of files) {
    const raw = readFileSync(join(WORK_DIR, file), 'utf8')
    const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
    if (!m) throw new Error(`content/work/${file}: missing frontmatter block`)
    const fm: Record<string, string> = {}
    for (const line of m[1].split('\n')) {
      const i = line.indexOf(':')
      if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim()
    }
    if (!fm.title || !fm.image) throw new Error(`content/work/${file}: title and image are required`)
    entries.push({
      title: fm.title,
      finishes: (fm.finishes || '').split(',').map((s) => s.trim()).filter(Boolean),
      image: fm.image,
      order: Number(fm.order) || 0,
      caption: m[2].trim(),
    })
  }
  return entries.sort((a, b) => a.order - b.order)
}
