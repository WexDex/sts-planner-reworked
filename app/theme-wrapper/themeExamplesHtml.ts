/** Sections split out from theme reference HTML for unified Examples layout (hosted route). */

function sectionH2Heading(el: Element): string {
  const h2 = el.querySelector(":scope > h2");
  return h2?.textContent?.trim() ?? "";
}

/** Split `.page-wrap` children: before Game cards; Decision Timeline section alone; everything else after Game cards except DTL. */
export function splitThemeExamplesHtml(html: string): {
  before: string;
  midTail: string;
  dtlSection: string;
} | null {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const wrap = doc.querySelector(".page-wrap");
  if (!wrap) return null;

  const kids = Array.from(wrap.children);
  const gameIdx = kids.findIndex((el) => {
    if (el.tagName !== "SECTION") return false;
    return sectionH2Heading(el).startsWith("Game cards (STSCard)");
  });

  if (gameIdx === -1) {
    return {
      before: kids.map((k) => k.outerHTML).join(""),
      midTail: "",
      dtlSection: "",
    };
  }

  const tail = kids.slice(gameIdx + 1);
  const dtlIdx = tail.findIndex((el) => {
    if (el.tagName !== "SECTION") return false;
    const t = sectionH2Heading(el);
    return t.startsWith("Decision Timeline tool");
  });

  let midTail: string;
  let dtlSection: string;
  if (dtlIdx === -1) {
    midTail = tail.map((k) => k.outerHTML).join("");
    dtlSection = "";
  } else {
    dtlSection = tail[dtlIdx]!.outerHTML;
    midTail = tail
      .filter((_, i) => i !== dtlIdx)
      .map((k) => k.outerHTML)
      .join("");
  }

  return {
    before: kids.slice(0, gameIdx).map((k) => k.outerHTML).join(""),
    midTail,
    dtlSection,
  };
}
