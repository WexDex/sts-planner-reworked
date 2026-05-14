import stsBundle from "@/app/data/db/STS_CARDS_DB.json";
import CardFieldEditorClient from "./CardFieldEditorClient";

export default function CardFieldEditorPage() {
  const { cards, _meta, iconCatalog, attributeIconLinks } = stsBundle as any;
  return (
    <CardFieldEditorClient
      initialBundle={cards}
      bundleMeta={{ _meta, iconCatalog, attributeIconLinks }}
    />
  );
}
