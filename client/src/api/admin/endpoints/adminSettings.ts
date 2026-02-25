import { authedFetch } from "../../utils";

export interface AdminSettings {
  disableSignup: boolean;
}

export function fetchAdminSettings() {
  return authedFetch<AdminSettings>("/admin/settings");
}

export function updateAdminSetting(key: string, value: any) {
  return authedFetch<{ success: boolean }>("/admin/settings", undefined, {
    method: "PUT",
    data: { key, value },
    headers: { "Content-Type": "application/json" },
  });
}
