import { NextResponse } from "next/server";

function escapeCsv(value: unknown) {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function csvSampleResponse(filename: string, headers: string[], sample: unknown[]) {
  const csv = `\uFEFF${headers.map(escapeCsv).join(",")}\n${sample.map(escapeCsv).join(",")}\n`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
