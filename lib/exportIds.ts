import { isValidObjectId } from "mongoose";

export function getExportFilter(request: Request): Record<string, unknown> {
  const ids = new URL(request.url).searchParams
    .get("ids")
    ?.split(",")
    .map((id) => id.trim())
    .filter((id) => isValidObjectId(id));

  return ids?.length ? { _id: { $in: ids } } : {};
}
