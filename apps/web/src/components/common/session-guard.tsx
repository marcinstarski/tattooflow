"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

const REMEMBER_KEY = "taflo_remember";
const LOGIN_AT_KEY = "taflo_login_at";
const ONE_HOUR = 60 * 60 * 1000;

export function SessionGuard() {
  useEffect(() => {
    const remember = localStorage.getItem(REMEMBER_KEY) === "1";
    const loginAtRaw = localStorage.getItem(LOGIN_AT_KEY);
    const loginAt = loginAtRaw ? Number(loginAtRaw) : 0;
    if (!remember && loginAt && Date.now() - loginAt > ONE_HOUR) {
      signOut({ callbackUrl: "/auth/login" });
    }
  }, []);

  return null;
}
