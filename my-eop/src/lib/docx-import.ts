import "server-only";
import mammoth from "mammoth";
import TurndownService from "turndown";
import * as cheerio from "cheerio";

// Converts an uploaded .docx into a draft the admin reviews and edits
// before anything is written to the database (see the review UI in
// admin/(protected)/import) — this never writes content on its own.
// Mammoth converts the docx into clean semantic HTML (headings, bold/
// italic, lists, tables); everything below just reshapes that HTML into
// this app's two content shapes.

export interface DraftPage {
  title: string;
  body: string; // Markdown
}

export interface SectionDraft {
  title: string;
  pages: DraftPage[];
}

export interface ChecklistDraft {
  title: string;
  items: string[];
}

const turndown = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" });
// GFM tables aren't part of turndown's core rule set.
turndown.addRule("table", {
  filter: "table",
  replacement: (_content: string, node: unknown) => {
    const outerHTML = (node as { outerHTML?: string }).outerHTML ?? "";
    const $ = cheerio.load(outerHTML);
    const rows = $("tr")
      .toArray()
      .map((tr) =>
        $(tr)
          .find("td, th")
          .toArray()
          .map((cell) => $(cell).text().trim().replace(/\|/g, "\\|").replace(/\s+/g, " "))
      )
      .filter((row) => row.length > 0);
    if (rows.length === 0) return "";

    const header = rows[0];
    const body = rows.slice(1);
    const line = (cells: string[]) => `| ${cells.join(" | ")} |`;
    const sep = `| ${header.map(() => "---").join(" | ")} |`;
    return `\n\n${[line(header), sep, ...body.map(line)].join("\n")}\n\n`;
  },
});

async function docxToHtml(buffer: Buffer): Promise<{ html: string; warnings: string[] }> {
  const result = await mammoth.convertToHtml({ buffer });
  return { html: result.value, warnings: result.messages.map((m) => m.message) };
}

function fallbackTitle(filename: string): string {
  return filename.replace(/\.docx$/i, "").replace(/[_-]+/g, " ").trim();
}

// Section import: splits on top-level headings (Word "Heading 1/2" styles)
// into separate pages. Most of the documents this app has ingested so far
// don't use real Word heading styles (they use bold paragraphs instead), so
// the common case is one page holding the whole document — the admin can
// split it up afterward in the existing Plan Content editor, same as any
// other page edit.
export async function parseDocxAsSection(buffer: Buffer, filename: string): Promise<SectionDraft> {
  const { html } = await docxToHtml(buffer);
  const $ = cheerio.load(html, { xml: false });

  const headings = $("h1, h2").toArray();

  if (headings.length === 0) {
    const markdown = turndown.turndown($("body").html() ?? html).trim();
    return { title: fallbackTitle(filename), pages: [{ title: "Page 1", body: markdown }] };
  }

  const pages: DraftPage[] = [];
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const title = $(heading).text().trim() || `Page ${i + 1}`;
    const wrapper = $("<div></div>");
    let node = $(heading).next();
    while (node.length > 0 && !["h1", "h2"].includes((node.get(0) as { tagName?: string })?.tagName?.toLowerCase() ?? "")) {
      wrapper.append(node.clone());
      node = node.next();
    }
    const markdown = turndown.turndown(wrapper.html() ?? "").trim();
    pages.push({ title, body: markdown });
  }

  return { title: fallbackTitle(filename), pages };
}

// Checklist import: table rows shaped like {#, Action, Responsible,
// Completed} (the pattern used across every IC activation checklist so far)
// become one item per row, with a single wide/merged cell treated as a
// phase-header marker item. Falls back to flattening bullet lists / bold
// paragraphs when there's no table — same "PHASE:" marker convention used
// throughout this app's existing checklists.
export async function parseDocxAsChecklist(buffer: Buffer, filename: string): Promise<ChecklistDraft> {
  const { html } = await docxToHtml(buffer);
  const $ = cheerio.load(html, { xml: false });

  const items: string[] = [];
  const table = $("table").toArray().find((t) => $(t).find("tr").length > 2);

  if (table) {
    const rows = $(table).find("tr").toArray();
    const headerCells = $(rows[0])
      .find("th, td")
      .toArray()
      .map((c) => $(c).text().trim().toLowerCase());
    const responsibleCol = headerCells.findIndex((h) => h.includes("responsible"));
    const numberCol = headerCells.findIndex((h) => h === "#" || h === "no." || h === "no");
    // The "action"/description column — the one with the actual task text.
    // Prefer a header literally called "action"; otherwise assume it's
    // whichever non-#, non-responsible column holds the most text across
    // the body rows (robust to differently-labeled or unlabeled columns).
    let actionCol = headerCells.findIndex((h) => h.includes("action") || h.includes("task") || h.includes("item"));
    if (actionCol < 0) {
      const bodyRows = rows.slice(1);
      const lengths = headerCells.map((_, col) =>
        bodyRows.reduce((sum, row) => {
          const cell = $(row).find("td, th").toArray()[col];
          return sum + (cell ? $(cell).text().length : 0);
        }, 0)
      );
      actionCol = lengths.indexOf(Math.max(...lengths));
    }

    for (const row of rows.slice(1)) {
      const cells = $(row).find("td, th").toArray();
      if (cells.length === 0) continue;

      const isMerged = cells.length === 1 || $(cells[0]).attr("colspan");
      if (isMerged) {
        const text = $(cells[0]).text().trim();
        if (text) items.push(`PHASE: ${text}`);
        continue;
      }

      const actionCell = cells[actionCol] ?? cells[0];
      const actionHtml = $(actionCell).html() ?? "";
      const actionCell$ = cheerio.load(actionHtml);
      const bold = actionCell$("strong, b").first().text().trim();
      const rest = actionCell$.root()
        .text()
        .replace(bold, "")
        .trim();
      const label = bold || $(actionCell).text().trim();
      const detail = bold && rest ? ` — ${rest}` : "";

      const number = numberCol >= 0 && cells[numberCol] ? $(cells[numberCol]).text().trim() : "";
      const prefix = number ? `${number}. ` : "";

      const responsible =
        responsibleCol >= 0 && cells[responsibleCol] ? $(cells[responsibleCol]).text().trim() : "";
      const suffix = responsible ? ` (Responsible: ${responsible})` : "";

      const text = `${prefix}${label}${detail}${suffix}`.trim();
      if (text) items.push(text);
    }
  } else {
    // No table: flatten headings/bold paragraphs as phase markers and every
    // list item / plain paragraph as its own item.
    $("body")
      .children()
      .toArray()
      .forEach((el) => {
        const tag = (el as { tagName?: string }).tagName?.toLowerCase();
        if (tag === "ul" || tag === "ol") {
          $(el)
            .find("li")
            .toArray()
            .forEach((li) => {
              const text = $(li).text().trim();
              if (text) items.push(text);
            });
        } else if (tag === "h1" || tag === "h2" || tag === "h3") {
          const text = $(el).text().trim();
          if (text) items.push(`PHASE: ${text}`);
        } else if (tag === "p") {
          const isBoldOnly = $(el).children().length === 1 && $(el).find("strong, b").length === 1;
          const text = $(el).text().trim();
          if (!text) return;
          items.push(isBoldOnly ? `${text}:` : text);
        }
      });
  }

  return { title: fallbackTitle(filename), items };
}
