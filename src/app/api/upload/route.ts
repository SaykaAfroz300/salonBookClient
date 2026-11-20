import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ImgBB image hosting is not configured on the server (IMGBB_API_KEY missing).",
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Please select an image file to upload." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Only image files (JPG, PNG, WEBP) are allowed." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Image size must be under 5 MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const uploadBody = new URLSearchParams();
    uploadBody.append("image", base64);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: uploadBody,
      }
    );

    const result = await response.json();

    if (!response.ok || !result?.success || !result?.data?.display_url) {
      return NextResponse.json(
        {
          success: false,
          message: result?.error?.message || "Failed to upload image to ImgBB.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.data.display_url,
      deleteUrl: result.data.delete_url,
    });
  } catch (error) {
    console.error("ImgBB upload error:", error);
    return NextResponse.json(
      { success: false, message: "Image upload failed. Please try again." },
      { status: 500 }
    );
  }
}
