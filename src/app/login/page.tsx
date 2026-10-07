"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();

  // =========================
  // STATES
  // =========================

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =========================
  // LOGIN
  // =========================

  async function handleLogin(
    e: FormEvent<HTMLFormElement>
  ) {

    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {

      const response =
        await fetch("/api/login", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        });

      const data =
        await response.json();

      // =========================
      // ERROR
      // =========================

      if (!response.ok) {

        setMessage(
          data.message
        );

        return;
      }

      // =========================
      // SUCCESS
      // =========================

      console.log(
        "Utilisateur connecté :",
        data.user
      );

      console.log(
        "Role :",
        data.user.role
      );

      // =========================
      // REDIRECTION
      // =========================

      if (data.user.role === "ADMIN") {
        router.push("/admin");
        } else {
        router.push("/user");
        }

    } catch (error) {

      console.error(error);

      setMessage(
        "Impossible de contacter le serveur"
      );

    } finally {

      setLoading(false);

    }
  }

  // =========================
  // UI
  // =========================

  return (
    <main className="auth-container">

      <div className="auth-card">

        <h1>
          Connexion
        </h1>

        <form
          onSubmit={handleLogin}
        >

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="password">
              Mot de passe
            </label>

            <input
              id="password"
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>

          <button
            className="auth-button"
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Connexion..."
              : "Se connecter"}

          </button>

        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <p className="auth-link">

          Vous n'avez pas encore
          de compte ?{" "}

          <a href="/register">
            Créer un compte
          </a>

        </p>

      </div>

    </main>
  );
}