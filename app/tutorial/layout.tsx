import { buildGlossaryExampleIndex } from "@/app/tutorial/glossary-example-index";
import { getTutorialSearchIndex } from "@/app/tutorial/search-index";
import TutorialChrome from "@/app/tutorial/TutorialChrome.client";
import { TutorialGlossaryPreviewProvider } from "@/app/tutorial/TutorialGlossaryPreview.client";

export default function TutorialLayout({ children }: { children: React.ReactNode }) {
  const searchIndex = getTutorialSearchIndex();
  const glossaryExamples = buildGlossaryExampleIndex();
  return (
    <TutorialChrome searchIndex={searchIndex}>
      <TutorialGlossaryPreviewProvider index={glossaryExamples}>{children}</TutorialGlossaryPreviewProvider>
    </TutorialChrome>
  );
}
