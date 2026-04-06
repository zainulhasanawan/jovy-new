import { useMutation, useQueryClient } from "@tanstack/react-query";

import { login as loginApi } from "../services/apiAuth";

type LoginPayload = {
  email: string;
  password: string;
};

export function useLogin() {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ email, password }: LoginPayload) =>
      loginApi({ email, password }),
  });

  async function login(payload: LoginPayload) {
    const user = await mutateAsync(payload);
    queryClient.setQueryData(["user"], user ?? null);
    return user;
  }

  return { login, isLoading: isPending };
}
