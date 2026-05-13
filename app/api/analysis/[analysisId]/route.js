import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AuthUser from "@/models/AuthUser";
import Analysis from "@/models/Analysis";
import { verifyAuthToken } from "@/lib/token";

function getTokenFromRequest(request) {
  const cookieToken = request.cookies.get("token")?.value;
  if (cookieToken) return cookieToken;

  const authHeader = request.headers.get("authorization") || "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  return null;
}

export async function GET(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    let payload;
    try {
      payload = await verifyAuthToken(token);
    } catch {
      return NextResponse.json(
        { error: "Unauthorized. Invalid or expired token." },
        { status: 401 }
      );
    }

    const userId = payload?.sub;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid token payload." },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await AuthUser.findById(userId).select("_id email");
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const analysisId = params?.analysisId;
    const analysis = await Analysis.findOne({ _id: analysisId, userId: user._id }).lean();

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        analysis: {
          id: analysis._id.toString(),
          fileName: analysis.fileName,
          jobTitle: analysis.jobTitle,
          companyName: analysis.companyName,
          feedback: analysis.feedback,
          createdAt: analysis.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis", details: error.message },
      { status: 500 }
    );
  }
}
