import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { loginSchema } from "@/lib/validation";

// =========================
// SECRET
// =========================

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET
);

// =========================
// LOGIN
// =========================

export async function POST(
  request: Request
) {
  try {
    // =========================
    // RECUPERER LES DONNEES
    // =========================

    const body = await request.json();

    // =========================
    // VALIDATION ZOD
    // =========================

    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: result.error.issues[0].message,
        },
        {
          status: 400,
        }
      );
    }

    // Données validées et normalisées par Zod
    const {
      email,
      password,
    } = result.data;

    // =========================
    // RECHERCHE UTILISATEUR
    // =========================

    const user =
      await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

    // =========================
    // UTILISATEUR NON TROUVE
    // =========================

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Email ou mot de passe incorrect",
        },
        {
          status: 401,
        }
      );
    }

    // =========================
    // VERIFIER LE MOT DE PASSE
    // =========================

    const passwordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordCorrect) {
      return NextResponse.json(
        {
          message:
            "Email ou mot de passe incorrect",
        },
        {
          status: 401,
        }
      );
    }

    // =========================
    // CREER LE JWT
    // =========================

    const token =
      await new SignJWT({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
        .setProtectedHeader({
          alg: "HS256",
        })
        .setIssuedAt()
        .setExpirationTime("1d")
        .sign(secret);

    // =========================
    // CREER LA REPONSE
    // =========================

    const response =
      NextResponse.json({
        message: "Connexion réussie",

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

    // =========================
    // COOKIE AUTH TOKEN
    // =========================

    response.cookies.set(
      "auth_token",
      token,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        path: "/",

        maxAge:
          60 * 60 * 24,
      }
    );

    return response;

  } catch (error) {
    // =========================
    // ERREUR SERVEUR
    // =========================

    console.error(
      "LOGIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Une erreur serveur est survenue",
      },
      {
        status: 500,
      }
    );
  }
}