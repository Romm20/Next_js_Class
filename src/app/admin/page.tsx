import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET
);

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const { payload } = await jwtVerify(token!, secret);

    if (payload.role !== "ADMIN") {
      redirect("/user");
    }

    const adminName =
      typeof payload.name === "string"
        ? payload.name
        : "Administrateur";

    return (
      <main className="admin-page">
        <div className="admin-container">
          <h1>Dashboard Admin</h1>

          <h2>Bienvenue {adminName} </h2>

          <p>
            Vous êtes connecté en tant qu'administrateur.
          </p>

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
        </div>
      </main>
    );
  } catch (error) {
    console.error("ADMIN AUTH ERROR:", error);
    redirect("/login");
  }
}