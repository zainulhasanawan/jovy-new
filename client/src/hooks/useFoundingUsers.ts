import { useQuery } from "@tanstack/react-query";

export type FoundingUsersResponse = {
  remaining: number;
  total: number;
};

async function getFoundingUsersRemaining(): Promise<FoundingUsersResponse> {
  const response = await fetch("/api/founding-users/remaining");

  if (!response.ok) {
    return { remaining: 0, total: 0 };
  }

  return response.json();
}

export function useFoundingUsers() {
  return useQuery<FoundingUsersResponse>({
    queryKey: ["founding-users-remaining"],
    queryFn: getFoundingUsersRemaining,
    retry: false,
    staleTime: 30_000,
  });
}
