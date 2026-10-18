import { useEffect, useState } from 'react';

export type Page = 'home' | 'privacy' | 'terms' | 'accessibility' | 'data';

const ROUTES: Record<string, Page> = {
  '#/privacy': 'privacy',
  '#/terms': 'terms',
  '#/accessibility': 'accessibility',
  '#/data': 'data',
};

const TITLES: Record<Page, string> = {
  home: 'ShiftedMind · Tone Lab — read the room before you hit send',
  privacy: 'Privacy notice · ShiftedMind Tone Lab',
  terms: 'Terms of use · ShiftedMind Tone Lab',
  accessibility: 'Accessibility statement · ShiftedMind Tone Lab',
  data: 'Local data and controls · ShiftedMind Tone Lab',
};

function readPage(): Page {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace(/\/+$/, '');
  return ROUTES[hash] ?? 'home';
}

/**
 * Hash routing keeps the legal pages reachable on static hosting without a
 * server rewrite. Unknown hashes (including the in-page anchors like `#gym`)
 * fall back to the lab.
 */
export function useHashRoute(): Page {
  const [page, setPage] = useState<Page>(readPage);

  useEffect(() => {
    const onHashChange = () => setPage(readPage());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.title = TITLES[page];
    if (page === 'home') return;
    // The stylesheet asks for smooth scrolling, which would make a route change
    // glide up from the footer. `instant` overrides it, so a new page always
    // starts at the top instead of animating there.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [page]);

  return page;
}

export function pageTitle(page: Page): string {
  return TITLES[page];
}
