import { describe, it, expect } from 'vitest';
import { createNavState } from '@/hooks/use-fullscreen-nav';

describe('fullscreen nav state', () => {
  it('starts at section 0', () => {
    const nav = createNavState(6);
    expect(nav.index()).toBe(0);
  });

  it('advances on next()', () => {
    const nav = createNavState(6);
    nav.next();
    expect(nav.index()).toBe(1);
  });

  it('does not exceed max', () => {
    const nav = createNavState(6);
    for (let i = 0; i < 10; i++) nav.next();
    expect(nav.index()).toBe(5);
  });

  it('goes back on prev()', () => {
    const nav = createNavState(6);
    nav.next();
    nav.next();
    nav.prev();
    expect(nav.index()).toBe(1);
  });

  it('does not go below 0', () => {
    const nav = createNavState(6);
    nav.prev();
    nav.prev();
    expect(nav.index()).toBe(0);
  });

  it('goTo jumps directly', () => {
    const nav = createNavState(6);
    nav.goTo(4);
    expect(nav.index()).toBe(4);
  });

  it('goTo clamps to valid range', () => {
    const nav = createNavState(6);
    nav.goTo(99);
    expect(nav.index()).toBe(5);
    nav.goTo(-5);
    expect(nav.index()).toBe(0);
  });
});
