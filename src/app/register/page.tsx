"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

export default function RegisterPage() {

  const router = useRouter();

  // =========================
  // STATES
  // =========================

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =========================
  // REGISTER
  // =========================

  async function handleRegister(
    e: FormEvent<HTMLFormElement>
  ) {

    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {

      const response =
        await fetch("/api/register", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
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

      setMessage(
        "Compte créé avec succès !"
      );

      setTimeout(() => {
        router.push("/login");
      }, 1000);

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
          Créer un compte
        </h1>

        <form
          onSubmit={handleRegister}
        >

          <div className="form-group">

            <label htmlFor="name">
              Nom
            </label>

            <input
              id="name"
              type="text"
              placeholder="Votre nom"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />

          </div>

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
              placeholder="Minimum 6 caractères"
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
              ? "Création..."
              : "Créer un compte"}

          </button>

        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <p className="auth-link">

          Vous avez déjà un compte ?{" "}

          <a href="/login">
            Se connecter
          </a>

        </p>

      </div>

    </main>
  );
}