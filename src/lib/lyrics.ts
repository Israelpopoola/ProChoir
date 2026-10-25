export type LyricBlock = { label: string | null; lines: string[] };

const SECTION_WORDS =
  "verse|chorus|pre-?chorus|bridge|intro|outro|tag|vamp|ending|interlude|refrain|hook|turnaround|instrumental|coda";
const bracketed = /^\s*\[(.+?)\]\s*$/;
const bare = new RegExp(`^\\s*((?:${SECTION_WORDS})(?:\\s*\\d+)?)\\s*:?\\s*$`, "i");

export function sectionLabel(line: string): string | null {
  const m = line.match(bracketed) ?? line.match(bare);
  return m ? m[1].trim() : null;
}

/**
 * Splits lyrics into blocks. A blank line starts a new block (a new slide in
 * ProPresenter / FreeShow). A line like "[Chorus]" or "Verse 2" labels a block.
 */
export function parseLyrics(text: string): LyricBlock[] {
  const blocks: LyricBlock[] = [];
  let current: LyricBlock | null = null;
  let pendingLabel: string | null = null;

  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    const label = sectionLabel(line);
    if (label) {
      if (current) blocks.push(current);
      current = null;
      pendingLabel = label;
      continue;
    }
    if (line.trim() === "") {
      if (current) blocks.push(current);
      current = null;
      continue;
    }
    if (!current) {
      current = { label: pendingLabel, lines: [] };
      pendingLabel = null;
    }
    current.lines.push(line);
  }
  if (current) blocks.push(current);
  return blocks;
}

/**
 * Plain-text export for ProPresenter and FreeShow: one slide per block,
 * blank line between slides, section names as [Verse 1] lines.
 */
export function toPresentationText(text: string): string {
  return (
    parseLyrics(text)
      .map((b) => (b.label ? `[${b.label}]\n` : "") + b.lines.join("\n"))
      .join("\n\n") + "\n"
  );
}

export function safeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, " ").trim() || "Untitled";
}
