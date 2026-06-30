import { NextResponse } from "next/server";
import { uploadMenuImageToBlob } from "@/lib/admin/upload-menu-image-blob";
import { uploadMenuImageToLocalDisk } from "@/lib/admin/upload-menu-image-local";
import { isAdminRequestAuthorized } from "@/lib/auth/require-admin-request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdminRequestAuthorized())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("[menu-image] formData parse failed", error);
    return NextResponse.json(
      { error: "Could not read upload. Try a smaller image (under 4 MB)." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  }

  const result = process.env.BLOB_READ_WRITE_TOKEN
    ? await uploadMenuImageToBlob(file)
    : await uploadMenuImageToLocalDisk(file);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ url: result.url });
}
