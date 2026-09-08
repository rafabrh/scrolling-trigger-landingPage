import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('scroll reveal CSS contract', () => {
  const css = readFileSync(resolve('src/app/globals.css'), 'utf-8');

  it('defines scroll-section children as hidden by default', () => {
    expect(css).toContain('.scroll-section > *');
    expect(css).toContain('opacity: 0');
  });

  it('defines revealed state that makes children visible', () => {
    expect(css).toContain('.scroll-section.revealed > *');
    expect(css).toContain('opacity: 1');
  });

  it('defines stagger delays for child elements', () => {
    expect(css).toContain('transition-delay: 0.08s');
    expect(css).toContain('transition-delay: 0.16s');
  });

  it('defines headline-drift animation', () => {
    expect(css).toContain('.headline-drift');
    expect(css).toContain('.scroll-section.revealed .headline-drift');
  });

  it('no longer references section-enter (old scroll hijacking)', () => {
    expect(css).not.toContain('.section-enter');
  });
});

describe('scroll hijacking removal', () => {
  it('use-fullscreen-nav.ts no longer exists', () => {
    const hookPath = resolve('src/hooks/use-fullscreen-nav.ts');
    expect(existsSync(hookPath)).toBe(false);
  });
});
