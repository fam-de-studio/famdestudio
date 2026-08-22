export interface Inquiry {
  name: string
  email: string
  packing: string
  quantity: string
  destination: string
  finishes: string[]
  message: string
}

/** Returns human-readable problems; empty array = valid. Strips the honeypot. */
export function validateInquiry(body: unknown): { inquiry?: Inquiry; problems: string[]; honeypot: boolean } {
  const problems: string[] = []
  if (typeof body !== 'object' || body === null) return { problems: ['Bad request body.'], honeypot: false }
  const b = body as Record<string, unknown>

  // Honeypot: a hidden field real users never fill.
  if (typeof b.company_website === 'string' && b.company_website.trim() !== '') {
    return { problems: [], honeypot: true }
  }

  const str = (k: string) => (typeof b[k] === 'string' ? (b[k] as string).trim() : '')
  const name = str('name')
  const email = str('email')
  const packing = str('packing')

  if (!name) problems.push('Name is required.')
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push('A valid email is required.')
  if (!packing) problems.push('Tell me what you are packing.')

  if (problems.length) return { problems, honeypot: false }

  return {
    problems: [],
    honeypot: false,
    inquiry: {
      name,
      email,
      packing,
      quantity: str('quantity'),
      destination: str('destination'),
      finishes: Array.isArray(b.finishes) ? (b.finishes as unknown[]).filter((x) => typeof x === 'string').slice(0, 10) as string[] : [],
      message: str('message').slice(0, 4000),
    },
  }
}
