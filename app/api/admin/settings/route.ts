import { isAdminRequest, sanitizeInputText } from "@/lib/admin-auth";
import {
  serverGetAllSettings,
  serverGetSetting,
  serverSaveSetting,
} from "@/lib/supabase-server";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Owner access required." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawKey = searchParams.get("key");

    if (rawKey) {
      const key = sanitizeInputText(rawKey, 50);
      const value = await serverGetSetting(key);
      return Response.json({ key, value });
    }

    const settings = await serverGetAllSettings();
    const map: Record<string, any> = {};
    for (const item of settings) {
      map[item.key] = item.value;
    }
    return Response.json({ settings: map });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load settings.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Owner access required." }, { status: 403 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      key?: string;
      value?: any;
    };

    const key = sanitizeInputText(body?.key, 50);
    if (!key || !/^[a-zA-Z0-9_.-]{1,50}$/.test(key)) {
      return Response.json({ error: "A valid alphanumeric setting key is required." }, { status: 400 });
    }

    await serverSaveSetting(key, body.value);
    return Response.json({ success: true, key, value: body.value });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save setting.";
    return Response.json({ error: message }, { status: 500 });
  }
}
