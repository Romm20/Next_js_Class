import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    // =========================
    // RECUPERER LES DONNEES
    // =========================

    const body = await request.json();

    // =========================
    // VALIDATION ZOD
    // =========================

    const result = registerSchema.safeParse(body);

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

    // Données validées et nettoyées par Zod
    const {
      name,
      email,
      password,
    } = result.data;

    // =========================
    // VERIFIER SI L'EMAIL EXISTE
    // =========================

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "Cet email est déjà utilisé",
        },
        {
          status: 409,
        }
      );
    }

    // =========================
    // HASH DU MOT DE PASSE
    // =========================

    const hashedPassword =
      await bcrypt.hash(password, 10);

    // =========================
    // CREER L'UTILISATEUR
    // =========================

    const user =
      await prisma.user.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,

          // Un compte créé par Register
          // est toujours USER
          role: "USER",
        },
      });

    // =========================
    // REPONSE
    // =========================

    return NextResponse.json(
      {
        message: "Compte créé avec succès",

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    console.error(
      "REGISTER ERROR:",
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