import { describe, it, expect } from 'vitest'
import { MM_PER_INCH } from './constants'

describe('harness', () => {
  it('resolves the geometry module', () => {
    expect(MM_PER_INCH).toBe(25.4)
  })
})
