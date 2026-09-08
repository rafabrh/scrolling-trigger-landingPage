import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'

describe('layout fonts', () => {
  const layout = readFileSync('src/app/layout.tsx', 'utf8')

  it('uses Chakra_Petch for display', () => {
    expect(layout).toContain('Chakra_Petch')
    expect(layout).toContain('--font-chakra-petch')
  })

  it('uses Rajdhani for body', () => {
    expect(layout).toContain('Rajdhani')
    expect(layout).toContain('--font-rajdhani')
  })

  it('does NOT use old fonts', () => {
    expect(layout).not.toContain('Orbitron')
  })
})
