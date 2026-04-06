import type { User } from "@supabase/supabase-js";
import supabase from "./supabase";

type SignupPayload = {
  fullName: string;
  email: string;
  password: string;
};

type SignupResult = {
  user: User | null;
  needsEmailConfirmation: boolean;
};

type LoginPayload = {
  email: string;
  password: string;
};

export async function signup({
  fullName,
  email,
  password,
}: SignupPayload): Promise<SignupResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { fullName, avatar: "" } },
  });

  if (error) throw new Error(error.message);

  return {
    user: data.user,
    needsEmailConfirmation: !data.session,
  };
}

export async function login({
  email,
  password,
}: LoginPayload): Promise<User | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  return data.user;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) throw new Error(sessionError.message);
  if (!sessionData.session) return null;

  const { data, error } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);
  return data.user;
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
      queryParams: { prompt: "select_account" },
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signInWithFacebook(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}
