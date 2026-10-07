import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET
);

export default async function UserPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  let userName = "Utilisateur";

  try {
    const { payload } = await jwtVerify(token!, secret);

    if (typeof payload.name === "string") {
      userName = payload.name;
    }
  } catch (error) {
    console.error("AUTH ERROR:", error);
    redirect("/login");
  }

  async function logout() {
    "use server";

    const cookieStore = await cookies();

    cookieStore.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    redirect("/login");
  }

  return (
    <main className="user-page">
      <h1>Bienvenue {userName}</h1>

      <p>Bienvenue {userName} dans votre espace utilisateur.</p>

      <form action={logout}>
        <button type="submit" className="logout-button">
          Se déconnecter
        </button>
      </form>
    </main>
  );
}