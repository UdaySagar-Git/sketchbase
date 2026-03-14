import { redirect } from "next/navigation";
import { getKeyHash } from "@/lib/auth";
import { getWorkspaceSettings } from "@/app/actions";
import Navbar from "@/components/Navbar";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const keyHash = await getKeyHash();
  if (!keyHash) redirect("/");

  const settings = await getWorkspaceSettings();
  if (!settings) redirect("/");

  return (
    <div className="min-h-screen">
      <Navbar breadcrumbs={[{ label: "Settings" }]} />
      <div className="mx-auto max-w-lg px-6 py-10">
        <h1 className="text-2xl font-bold">Workspace Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage your workspace security and preferences.
        </p>

        <SettingsClient hasPassword={settings.hasPassword} createdAt={settings.createdAt} />
      </div>
    </div>
  );
}
