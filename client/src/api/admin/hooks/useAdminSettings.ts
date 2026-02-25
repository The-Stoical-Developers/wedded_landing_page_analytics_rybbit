import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminSettings, fetchAdminSettings, updateAdminSetting } from "../endpoints";

export function useAdminSettings() {
  return useQuery<AdminSettings>({
    queryKey: ["admin-settings"],
    queryFn: fetchAdminSettings,
  });
}

export function useUpdateAdminSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      updateAdminSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["configs"] });
    },
  });
}
