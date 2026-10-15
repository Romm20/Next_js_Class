
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import LogoutButton from "../components/LogoutButton";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const secretValue = process.env.AUTH_SECRET;

  if (!secretValue) {
    throw new Error("AUTH_SECRET n'est pas configuré");
  }

  // Vérifier le JWT et le rôle
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

    if (payload.role !== "ADMIN") {
      redirect("/user");
    }
  } catch {
    redirect("/login");
  }

  // Récupérer le profil via /api/me
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

    throw new Error("Impossible de récupérer le profil admin");
  }

  const user = await response.json();

  // Vérifier le rôle retourné par l'API
  if (user.role !== "ADMIN") {
    redirect("/user");
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        <h1>Dashboard Admin</h1>

        <h2>Bienvenue {user.name}</h2>

        <p>
          Vous êtes connecté en tant qu'administrateur.
        </p>

        <section className="admin-profile">
          <h2>Mon profil administrateur</h2>

          <p>Identifiant : {user.id}</p>
          <p>Nom : {user.name}</p>
          <p>Email : {user.email}</p>
          <p>Rôle : {user.role}</p>

          <p>
            Date de création :{" "}
            {new Date(user.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </section>

        <div className="admin-cards">
          <div className="admin-card">
            <h3>Utilisateurs</h3>
            <p>Gérer les utilisateurs</p>
          </div>

          <div className="admin-card">
            <h3>Produits</h3>
            <p>Gérer les produits</p>
          </div>

          <div className="admin-card">
            <h3>Statistiques</h3>
            <p>Voir les statistiques</p>
          </div>
        </div>

        <LogoutButton />
      </div>
    </main>
  );
}