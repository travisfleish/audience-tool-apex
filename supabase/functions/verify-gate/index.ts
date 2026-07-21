import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerifyRequest {
  password?: string;
  requirePassword?: boolean;
}

interface VerifyResponse {
  ok: boolean;
  clientId?: string;
}

function safeParsePasswords(json: string | undefined): Record<string, string> {
  if (!json || !json.trim()) return {};
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof k === "string" && typeof v === "string") out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function isGatePasswordsJsonPresentButInvalid(raw: string | undefined, parsed: Record<string, string>): boolean {
  if (!raw || !raw.trim()) return false;
  if (Object.keys(parsed).length > 0) return false;
  try {
    const tmp = JSON.parse(raw);
    return !(tmp && typeof tmp === "object" && !Array.isArray(tmp));
  } catch {
    return true;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ ok: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { password, requirePassword }: VerifyRequest = await req.json();

    const rawPasswordsJson = Deno.env.get("GATE_PASSWORDS_JSON");
    const passwordsMap = safeParsePasswords(rawPasswordsJson);
    const singlePassword = (Deno.env.get("GATE_PASSWORD") || "").trim();
    const passwordConfigured = Object.keys(passwordsMap).length > 0 || singlePassword.length > 0;
    const passwordRequired = Boolean(requirePassword) || passwordConfigured;

    if (passwordRequired) {
      const jsonInvalid = isGatePasswordsJsonPresentButInvalid(rawPasswordsJson, passwordsMap);
      if (jsonInvalid) {
        return new Response(
          JSON.stringify({ ok: false, error: "Gate misconfigured (invalid GATE_PASSWORDS_JSON)" }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }
      if (!passwordConfigured) {
        return new Response(
          JSON.stringify({ ok: false, error: "Gate misconfigured (missing password secret)" }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }
    }

    let clientId = "open-access";
    if (passwordRequired) {
      const pw = (password || "").trim();
      if (!pw) {
        return new Response(
          JSON.stringify({ ok: false, error: "Password required" }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      if (Object.keys(passwordsMap).length > 0) {
        const match = Object.entries(passwordsMap).find(([, v]) => v === pw);
        if (!match) {
          return new Response(
            JSON.stringify({ ok: false, error: "Invalid password" }),
            {
              status: 401,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            },
          );
        }
        clientId = match[0];
      } else {
        if (pw !== singlePassword) {
          return new Response(
            JSON.stringify({ ok: false, error: "Invalid password" }),
            {
              status: 401,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            },
          );
        }
        clientId = "default";
      }
    }

    return new Response(
      JSON.stringify({ ok: true, clientId } as VerifyResponse),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in verify-gate function:", error);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
