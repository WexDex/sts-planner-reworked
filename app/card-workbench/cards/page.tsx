import type { Metadata } from "next";
import stsBundle from "@/app/data/db/STS_CARDS_DB.json";
import { PlannerCardWorkbenchView } from "./planner-card-workbench-view";
import type { PlannerCardWorkbenchViewProps } from "./planner-types";

export const metadata: Metadata = {
  title: "Cards · Card workbench",
  description:
    "Browse app/data/db/STS_CARDS_DB.json: edit one card’s JSON at a time, layouts for fields vs preview, export full bundle view.",
};

function clonePlain<V>(value: V): PlannerCardWorkbenchViewProps["initialBundle"] {
  return JSON.parse(JSON.stringify(value)) as PlannerCardWorkbenchViewProps["initialBundle"];
}

export default function PlannerCardWorkbenchCardsPage() {
  const initialBundle = clonePlain(stsBundle);

  return (
    <PlannerCardWorkbenchView initialBundle={initialBundle} />
  );
}
