"use client";

import { Loader2 } from "lucide-react";
import { Label } from "../../../../components/ui/label";
import { Switch } from "../../../../components/ui/switch";
import {
  useAdminSettings,
  useUpdateAdminSetting,
} from "../../../../api/admin/hooks/useAdminSettings";

export function Settings() {
  const { data: settings, isLoading, isError } = useAdminSettings();
  const updateSetting = useUpdateAdminSetting();

  if (isLoading) {
    return (
      <div className="p-4 border border-neutral-100 dark:border-neutral-800 rounded-md">
        <h2 className="text-xl font-bold mb-4">Admin Settings</h2>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading settings...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 border border-neutral-100 dark:border-neutral-800 rounded-md">
        <h2 className="text-xl font-bold mb-4">Admin Settings</h2>
        <p className="text-red-500">Failed to load settings.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-neutral-100 dark:border-neutral-800 rounded-md">
      <h2 className="text-xl font-bold mb-4">Admin Settings</h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="disable-signup" className="text-base">
              Disable Registration
            </Label>
            <p className="text-sm text-muted-foreground">
              Prevent new users from signing up via email or social login. Existing users can still
              log in.
            </p>
          </div>
          <Switch
            id="disable-signup"
            checked={settings?.disableSignup ?? false}
            disabled={updateSetting.isPending}
            onCheckedChange={(checked) => {
              updateSetting.mutate({ key: "disableSignup", value: checked });
            }}
          />
        </div>
      </div>
    </div>
  );
}
