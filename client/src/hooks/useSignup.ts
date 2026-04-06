import { useMutation } from "@tanstack/react-query";

import { signup as signupApi } from "../services/apiAuth";

type SignupPayload = {
  fullName: string;
  email: string;
  password: string;
};

export function useSignup() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ fullName, email, password }: SignupPayload) =>
      signupApi({ fullName, email, password }),
  });

  async function signup(payload: SignupPayload) {
    return mutateAsync(payload);
  }

  return { signup, isLoading: isPending };
}
