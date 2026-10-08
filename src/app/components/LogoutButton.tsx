"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="logout-button"
    >
      Se déconnecter
    </button>
  );
}