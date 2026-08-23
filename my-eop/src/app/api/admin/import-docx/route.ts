import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseDocxAsSection, parseDocxAsChecklist } from "@/lib/docx-import";

// Parses an uploaded .docx into a draft only — nothing is written to the
// database here. The admin reviews/edits the draft client-side and publishes
// it themselves via the normal Supabase-client inserts (see import-form.tsx),
// same RLS-scoped path as every other admin write in this app.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const targetType = formData.get("targetType");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (targetType !== "section" && targetType !== "checklist") {
    return NextResponse.json({ error: "Invalid targetType" }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".docx")) {
    return NextResponse.json({ error: "Only .docx files are supported right now" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const draft =
      targetType === "section"
        ? await parseDocxAsSection(buffer, file.name)
        : await parseDocxAsChecklist(buffer, file.name);
    return NextResponse.json({ targetType, draft });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to parse document" },
      { status: 500 }
    );
  }
}
