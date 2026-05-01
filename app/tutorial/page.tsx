import type { Metadata } from "next";
import TutorialHub from "@/app/tutorial/TutorialHub";

export const metadata: Metadata = {
  title: "Tutorial · Getting started · Slay the Spire Combat Planner",
  description:
    "Tutorial hub: quick start, phases, planner UI shell, persistence overview, searchable glossary index, links to glyphs, Turn maker, timeline, cards, and theme guides.",
};

export default function TutorialPage() {
  return <TutorialHub />;
}
