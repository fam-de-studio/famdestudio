'use client'

import { useState } from 'react'
import { QUANTITIES, FINISH_CHIPS, SITE } from '@/content/site'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function InquiryForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [problems, setProblems] = useState<string[]>([])
  const [finishes, setFinishes] = useState<string[]>([])

  function toggleFinish(f: string) {
    setFinishes((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]))
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const payload = {
      name: fd.get('name'),
      email: fd.get('email'),
      packing: fd.get('packing'),
      quantity: fd.get('quantity'),
      destination: fd.get('destination'),
      finishes,
      message: fd.get('message'),
      company_website: fd.get('company_website'), // honeypot
    }
    setStatus('sending')
    setProblems([])
    try {
      const r = await fetch('/api/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await r.json().catch(() => ({}))
      if (r.ok && d.ok) {
        setStatus('sent')
      } else {
        setProblems(Array.isArray(d.problems) ? d.problems : ['Something went wrong.'])
        setStatus('error')
      }
    } catch {
      setProblems(['Could not reach the server.'])
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="max-w-[580px]">
        <p className="font-display text-2xl">Got it.</p>
        <p className="mt-3" style={{ color: 'var(--dim)' }}>
          I reply within one working day — usually faster. If it&apos;s urgent, WhatsApp{' '}
          <a href={SITE.whatsappHref} className="underline" style={{ color: 'var(--brass)' }}>
            {SITE.whatsapp}
          </a>
          .
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="max-w-[580px]">
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[13.5px]" style={{ color: 'var(--dim)' }}>Name</span>
          <input name="name" required className="field" placeholder="Hannah Vance" />
        </label>
        <label className="block">
          <span className="mb-2 block text-[13.5px]" style={{ color: 'var(--dim)' }}>Email</span>
          <input name="email" type="email" required className="field" placeholder="hannah@brand.co.uk" />
        </label>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-[13.5px]" style={{ color: 'var(--dim)' }}>What are you packing?</span>
        <input name="packing" required className="field" placeholder="50 ml serum carton" />
      </label>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[13.5px]" style={{ color: 'var(--dim)' }}>Quantity</span>
          <select name="quantity" className="field">
            {QUANTITIES.map((q) => <option key={q}>{q}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-[13.5px]" style={{ color: 'var(--dim)' }}>Where to?</span>
          <input name="destination" className="field" placeholder="Bristol, United Kingdom" />
        </label>
      </div>

      <div className="mt-5">
        <span className="mb-2 block text-[13.5px]" style={{ color: 'var(--dim)' }}>Finishes you&apos;re drawn to</span>
        <div className="flex flex-wrap gap-2.5">
          {FINISH_CHIPS.map((f) => (
            <button key={f} type="button" className="chip" aria-pressed={finishes.includes(f)} onClick={() => toggleFinish(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-[13.5px]" style={{ color: 'var(--dim)' }}>Anything else, plus a link to your logo</span>
        <textarea name="message" rows={4} className="field" placeholder="Dropbox or Drive link is fine." />
      </label>

      {status === 'error' && (
        <div className="mt-5 rounded border px-4 py-3 text-[13.5px]" style={{ borderColor: 'rgba(201,162,39,.4)', color: 'var(--dim)' }}>
          {problems.map((p) => <p key={p}>{p}</p>)}
          <p className="mt-2">
            Or email me directly:{' '}
            <a className="underline" style={{ color: 'var(--brass)' }} href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
        </div>
      )}

      <button type="submit" className="cta mt-6" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send enquiry'}
      </button>
    </form>
  )
}
