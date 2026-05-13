import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "app", "data", "custom_card_actions.json");
const BACKUP_PATH = path.join(process.cwd(), "app", "data", "custom_card_actions.backup.json");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("backup") === "true" ? BACKUP_PATH : DATA_PATH;
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("reset") === "true") {
    try {
      const backup = fs.readFileSync(BACKUP_PATH, "utf-8");
      fs.writeFileSync(DATA_PATH, backup, "utf-8");
      return NextResponse.json({ ok: true, reset: true });
    } catch {
      return NextResponse.json({ error: "No backup found" }, { status: 404 });
    }
  }

  try {
    // Create backup on first save if it doesn't already exist
    if (!fs.existsSync(BACKUP_PATH)) {
      const current = fs.readFileSync(DATA_PATH, "utf-8");
      fs.writeFileSync(BACKUP_PATH, current, "utf-8");
    }
    const body = await request.json();
    fs.writeFileSync(DATA_PATH, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
