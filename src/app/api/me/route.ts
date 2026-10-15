
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const secretValue = process.env.AUTH_SECRET;

    if (!secretValue) {
      throw new Error("AUTH_SECRET n'est pas configuré");
    }

    // Lire le même cookie que /api/login
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérifier le JWT avec le même secret que /api/login
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secretValue)
    );

    if (
      typeof payload.userId !== "number" &&
      typeof payload.userId !== "string"
    ) {
      return NextResponse.json(
        { error: "Token invalide" },
        { status: 401 }
      );
    }

    const userId = Number(payload.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Token invalide" },
        { status: 401 }
      );
    }

    // Récupérer le profil depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/me:", error);

    return NextResponse.json(
      { error: "Session invalide ou erreur serveur" },
      { status: 401 }
    );
  }
}
