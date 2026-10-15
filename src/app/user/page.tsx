
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import LogoutButton from "../components/LogoutButton";

export default async function UserPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const secretValue = process.env.AUTH_SECRET;

  if (!secretValue) {
    throw new Error("AUTH_SECRET n'est pas configuré");
  }

  // Vérifier le JWT
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secretValue)
    );

    if (
      typeof payload.userId !== "number" &&
      typeof payload.userId !== "string"
    ) {
      redirect("/login");
    }

    const userId = Number(payload.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      redirect("/login");
    }

    // Rediriger les administrateurs
    if (payload.role === "ADMIN") {
      redirect("/admin");
    }
  } catch {
    redirect("/login");
  }

  // Utiliser l'API /api/me
  const baseUrl =
    process.env.APP_URL ?? "http://localhost:3000";

  let response: Response;

  try {
    response = await fetch(`${baseUrl}/api/me`, {
      headers: {
        Cookie: `auth_token=${token}`,
      },
      cache: "no-store",
    });
  } catch (error) {
    console.error("Erreur réseau /api/me :", error);
    throw new Error("Impossible de contacter l'API /api/me");
  }

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    console.error(
      "Erreur API /api/me :",
      response.status,
      await response.text()
    );

    throw new Error("Impossible de récupérer le profil utilisateur");
  }

  const user = await response.json();

  // Vérifier le rôle retourné par l'API
  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <main className="user-page">
      <h1>Bienvenue {user.name}</h1>

      <p>
        Bienvenue {user.name} dans votre espace utilisateur.
      </p>

      <section>
        <h2>Mon profil</h2>

        <p>Identifiant : {user.id}</p>
        <p>Nom : {user.name}</p>
        <p>Email : {user.email}</p>

        <p>
          Date de création :{" "}
          {new Date(user.createdAt).toLocaleDateString("fr-FR")}
        </p>
      </section>

      <LogoutButton />
    </main>
  );
}
