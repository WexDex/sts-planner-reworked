/**
 * Tutorial “latest doc pass” highlight — amber left stripe + tinted panel.
 *
 * Maintainer workflow (each time you change tutorial copy):
 * 1. Search the repo for `tutorial-doc-update` and remove every wrapper / className
 *    use from the previous pass.
 * 2. Edit the docs, then wrap only the new or materially changed blocks with
 *    `TUTORIAL_DOC_UPDATE_CLASS`.
 * 3. Bump {@link TUTORIAL_DOC_PASS_VERSION} (and optionally mention it in `TutorialChrome.client.tsx` notice copy).
 * 4. Sync {@link TUTORIAL_ROUTES_WITH_DOC_UPDATES} with routes that still contain ≥1 striped block
 *    (grep `TUTORIAL_DOC_UPDATE_CLASS` / `tutorial-doc-update` under `app/tutorial/`).
 * 5. Update the notice copy in `TutorialChrome.client.tsx` if the topic of the pass changed.
 *
 * Goal: highlights always mean “this revision,” not an accumulating list of features.
 */
export const TUTORIAL_DOC_UPDATE_CLASS = "tutorial-doc-update" as const;

export const TUTORIAL_DOC_UPDATE_NOTICE_CLASS = "tutorial-doc-update-notice" as const;

/** Bump when you complete a doc pass (shown in chrome + per-page status strip). */
export const TUTORIAL_DOC_PASS_VERSION = "2026.05.18";

/**
 * Tutorial routes that currently include ≥1 `.tutorial-doc-update` region — drives amber badges on header nav links.
 * Keep in sync with grep under `app/tutorial/` (see workflow above).
 */
export const TUTORIAL_ROUTES_WITH_DOC_UPDATES = [
  "/tutorial",
  "/tutorial/turn-maker",
] as const;

/** Whether the fixed tutorial nav entry should show the doc-pass stripe (linked page has striped regions). */
export function tutorialNavHrefHasDocPassHighlights(href: string): boolean {
  const normalized = href.replace(/\/$/, "") || "/tutorial";
  return (TUTORIAL_ROUTES_WITH_DOC_UPDATES as readonly string[]).includes(normalized);
}
