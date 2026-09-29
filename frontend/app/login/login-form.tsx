"use client";

import Image from "next/image";
import { LockKeyhole, LogIn, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error || "Login gagal");
      router.replace(nextPath);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Login gagal");
    } finally {
      setPending(false);
    }
  }

  return <main className="login-page"><section className="login-card"><div className="login-brand"><Image src="/assets/logo-koni.png" alt="KONI" width={76} height={76} /><div><span>PANEL ADMINISTRATOR</span><h1>KONI Konawe Selatan</h1><p>Masuk untuk mengelola konten website.</p></div></div><form onSubmit={login}><label>Email<div><Mail /><input name="email" type="email" autoComplete="username" required placeholder="admin@konikonsel.id" /></div></label><label>Password<div><LockKeyhole /><input name="password" type="password" autoComplete="current-password" minLength={8} required placeholder="••••••••" /></div></label>{error && <p className="login-error" role="alert">{error}</p>}<button className="admin-primary" disabled={pending} type="submit"><LogIn />{pending ? "Memeriksa…" : "Masuk"}</button></form></section></main>;
}
