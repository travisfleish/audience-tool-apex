import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ActivationAudience {
  id: string;
  name: string;
  displayName: string;
}

interface DspSeatIdEntry {
  platform: string;
  seatId: string;
}

interface ActivationMoment {
  id: string;
  name: string;
  displayName: string;
}

interface SubmitActivationRequestBody {
  requestor_email: string;
  requestor_name?: string | null;
  requestor_company?: string | null;
  dsp: string;
  dsp_platforms?: string[] | null;
  dsp_seat_id?: string | null;
  dsp_seat_ids?: DspSeatIdEntry[] | null;
  preferred_inventory_channel?: string | null;
  notes?: string | null;
  app_variant?: string | null;
  buyer_seat?: string | null;
  campaign_name?: string | null;
  flight_dates?: string | null;
  flight_start?: string | null;
  flight_end?: string | null;
  approx_budget?: string | null;
  ssp_preference?: string | null;
  audiences: ActivationAudience[];
  moment?: ActivationMoment | null;
  request_kind?: "audience" | "moment" | "deal" | null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sanitizeAudiences(input: unknown): ActivationAudience[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item): ActivationAudience | null => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const id = asNonEmptyString(obj.id);
      const name = asNonEmptyString(obj.name);
      const displayName = asNonEmptyString(obj.displayName);
      if (!id || !name || !displayName) return null;
      return { id, name, displayName };
    })
    .filter((item): item is ActivationAudience => item !== null);
}

function sanitizeMoment(input: unknown): ActivationMoment | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;
  const id = asNonEmptyString(obj.id);
  const name = asNonEmptyString(obj.name);
  const displayName = asNonEmptyString(obj.displayName);
  if (!id || !name || !displayName) return null;
  return { id, name, displayName };
}

function sanitizeStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => asNonEmptyString(item))
    .filter((item): item is string => item !== null);
}

function sanitizeDspSeatIds(input: unknown): DspSeatIdEntry[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item): DspSeatIdEntry | null => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const platform = asNonEmptyString(obj.platform);
      const seatId = asNonEmptyString(obj.seatId);
      if (!platform || !seatId) return null;
      return { platform, seatId };
    })
    .filter((item): item is DspSeatIdEntry => item !== null);
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function buildPlainTextEmailBody(payload: {
  requestorEmail: string;
  requestorName: string | null;
  requestorCompany: string | null;
  dsp: string;
  dspPlatforms: string[];
  dspSeatId: string | null;
  dspSeatIds: DspSeatIdEntry[];
  preferredInventoryChannel: string | null;
  notes: string | null;
  appVariant: string | null;
  buyerSeat: string | null;
  campaignName: string | null;
  flightDates: string | null;
  approxBudget: string | null;
  sspPreference: string | null;
  audiences: ActivationAudience[];
  dealMoment: ActivationMoment | null;
  requestKind: "audience" | "moment" | "deal";
  submittedAtIso: string;
}) {
  const itemLines = payload.requestKind === "deal" && payload.dealMoment
    ? [
        "Custom Deal",
        `Audience: ${payload.audiences[0]?.displayName ?? "Not provided"}`,
        `Moment: ${payload.dealMoment.displayName}`,
      ].join("\n")
    : payload.audiences
      .map((audience, index) => `${index + 1}. ${audience.displayName}`)
      .join("\n");
  const isCustomAudienceRequest = payload.audiences.some(
    (audience) => audience.id === "custom-audience-request",
  );
  const itemsSectionLabel = payload.requestKind === "deal"
    ? null
    : payload.requestKind === "moment"
    ? "Moments"
    : isCustomAudienceRequest
    ? "Custom Audience Request"
    : "Audiences";

  const dspSeatIdLines = payload.dspSeatIds.length > 0
    ? payload.dspSeatIds.map((entry) => `  - ${entry.platform}: ${entry.seatId}`).join("\n")
    : `  - ${payload.dspSeatId ?? "Not provided"}`;

  const lines = [
    "New Deal ID request submitted from Audience Tool",
    "",
    "Requestor",
    `- Name: ${payload.requestorName ?? "Not provided"}`,
    `- Company: ${payload.requestorCompany ?? "Not provided"}`,
    `- Email: ${payload.requestorEmail}`,
    "",
    "Deal setup details",
    `- DSP / Platform(s): ${payload.dspPlatforms.length > 0 ? payload.dspPlatforms.join(", ") : payload.dsp}`,
  ];

  if (payload.buyerSeat) {
    lines.push(`- Buyer Seat: ${payload.buyerSeat}`);
  } else {
    lines.push("- DSP CIDs:", dspSeatIdLines);
  }

  if (payload.flightDates) {
    lines.push(`- Flight Date: ${payload.flightDates}`);
  }

  if (payload.campaignName || payload.approxBudget || payload.sspPreference) {
    lines.push("");
    lines.push("Campaign details");
    if (payload.campaignName) lines.push(`- Campaign Name: ${payload.campaignName}`);
    if (payload.approxBudget) lines.push(`- Approx Budget: ${payload.approxBudget}`);
    if (payload.sspPreference) lines.push(`- SSP Preference: ${payload.sspPreference}`);
  }

  lines.push(
    `- Preferred Inventory Channel: ${payload.preferredInventoryChannel ?? "Not provided"}`,
    "",
  );

  if (itemsSectionLabel) {
    lines.push(itemsSectionLabel, itemLines, "");
  } else {
    lines.push(itemLines, "");
  }

  lines.push(
    "Notes",
    payload.notes ?? "None",
    "",
    "Metadata",
    `- Submitted At (UTC): ${payload.submittedAtIso}`,
    `- App Variant: ${payload.appVariant ?? "Unknown"}`,
  );

  return lines.join("\n");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  try {
    const body = (await req.json()) as SubmitActivationRequestBody;

    const requestorEmail = asNonEmptyString(body.requestor_email);
    const requestorName = asNonEmptyString(body.requestor_name ?? null);
    const requestorCompany = asNonEmptyString(body.requestor_company ?? null);
    const dsp = asNonEmptyString(body.dsp);
    const dspPlatforms = sanitizeStringArray(body.dsp_platforms);
    const dspSeatId = asNonEmptyString(body.dsp_seat_id);
    const dspSeatIds = sanitizeDspSeatIds(body.dsp_seat_ids);
    const preferredInventoryChannel = asNonEmptyString(body.preferred_inventory_channel);
    const notes = asNonEmptyString(body.notes ?? null);
    const appVariant = asNonEmptyString(body.app_variant ?? null);
    const buyerSeat = asNonEmptyString(body.buyer_seat ?? null);
    const campaignName = asNonEmptyString(body.campaign_name ?? null);
    const flightDates = asNonEmptyString(body.flight_dates ?? null);
    const approxBudget = asNonEmptyString(body.approx_budget ?? null);
    const sspPreference = asNonEmptyString(body.ssp_preference ?? null);
    const audiences = sanitizeAudiences(body.audiences);
    const dealMoment = sanitizeMoment(body.moment ?? null);
    const requestKind = body.request_kind === "moment"
      ? "moment"
      : body.request_kind === "deal"
      ? "deal"
      : "audience";

    if (!requestorEmail || !EMAIL_REGEX.test(requestorEmail)) {
      return json(400, { ok: false, error: "A valid requestor email is required." });
    }
    if (!requestorName) {
      return json(400, { ok: false, error: "Requestor name is required." });
    }
    if (!requestorCompany) {
      return json(400, { ok: false, error: "Requestor company is required." });
    }
    if (!dsp) return json(400, { ok: false, error: "DSP or Platform is required." });
    if (appVariant === "index-exchange") {
      if (!buyerSeat) return json(400, { ok: false, error: "Buyer seat is required." });
      if (!campaignName) return json(400, { ok: false, error: "Campaign name is required." });
      if (!flightDates) return json(400, { ok: false, error: "Flight dates are required." });
      if (!sspPreference) return json(400, { ok: false, error: "SSP preference is required." });
    }
    if (audiences.length === 0) {
      return json(400, { ok: false, error: "At least one audience is required." });
    }
    if (requestKind === "deal" && !dealMoment) {
      return json(400, { ok: false, error: "A moment is required for custom deal requests." });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return json(500, { ok: false, error: "Supabase service credentials are not configured." });
    }

    const toEmail = asNonEmptyString(Deno.env.get("DEAL_DESK_TO_EMAIL"));
    const fromEmail = asNonEmptyString(Deno.env.get("DEAL_DESK_FROM_EMAIL"));
    const resendApiKey = asNonEmptyString(Deno.env.get("RESEND_API_KEY"));
    const subjectPrefix = asNonEmptyString(Deno.env.get("DEAL_DESK_SUBJECT_PREFIX"));

    if (!toEmail) {
      return json(500, { ok: false, error: "DEAL_DESK_TO_EMAIL is not configured." });
    }
    if (!fromEmail) {
      return json(500, { ok: false, error: "DEAL_DESK_FROM_EMAIL is not configured." });
    }
    if (!resendApiKey) {
      return json(500, { ok: false, error: "RESEND_API_KEY is not configured." });
    }

    const primaryAudience = audiences[0];
    const submittedAtIso = new Date().toISOString();
    const subjectParts = [
      subjectPrefix,
      requestKind === "deal" ? "Custom Deal Request" : "Deal ID Request",
      requestorCompany,
      requestKind === "deal" && dealMoment
        ? `${primaryAudience.displayName} + ${dealMoment.displayName}`
        : primaryAudience.displayName,
      dsp,
    ].filter((part): part is string => Boolean(part && part.trim().length > 0));
    const subject = subjectParts.join(" | ");

    const plainTextBody = buildPlainTextEmailBody({
      requestorEmail,
      requestorName,
      requestorCompany,
      dsp,
      dspPlatforms,
      dspSeatId: dspSeatId ?? null,
      dspSeatIds,
      preferredInventoryChannel: preferredInventoryChannel ?? null,
      notes,
      appVariant,
      buyerSeat,
      campaignName,
      flightDates,
      approxBudget,
      sspPreference,
      audiences,
      dealMoment,
      requestKind,
      submittedAtIso,
    });

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data: inserted, error: insertError } = await supabase
      .from("activation_requests")
      .insert({
        looking_for: ["Activation / Deal IDs"],
        request_kind: requestKind,
        audience_id:
          (requestKind === "audience" || requestKind === "deal") && UUID_REGEX.test(primaryAudience.id)
            ? primaryAudience.id
            : null,
        audience_name:
          requestKind === "audience" || requestKind === "deal" ? primaryAudience.name : null,
        audience_display_name:
          requestKind === "audience" || requestKind === "deal" ? primaryAudience.displayName : null,
        moment_id: requestKind === "moment"
          ? primaryAudience.id
          : requestKind === "deal" && dealMoment
          ? dealMoment.id
          : null,
        moment_name: requestKind === "moment"
          ? primaryAudience.displayName
          : requestKind === "deal" && dealMoment
          ? dealMoment.displayName
          : null,
        audiences: requestKind === "deal" && dealMoment
          ? [
            ...audiences,
            {
              id: dealMoment.id,
              name: dealMoment.name,
              displayName: dealMoment.displayName,
            },
          ]
          : audiences,
        dsp_platforms: dspPlatforms,
        dsp_seat_ids: dspSeatIds,
        app_variant: appVariant,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Failed to insert activation request:", insertError);
      return json(500, { ok: false, error: "Failed to save activation request." });
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        text: plainTextBody,
      }),
    });

    if (!emailResponse.ok) {
      const emailErrorText = await emailResponse.text();
      console.error("Failed to send activation email:", emailErrorText);
      return json(502, {
        ok: false,
        error: "Request saved, but email delivery failed. Please notify Deal Desk manually.",
        request_id: inserted.id,
      });
    }

    return json(200, { ok: true, request_id: inserted.id });
  } catch (error) {
    console.error("Error in submit-activation-request:", error);
    return json(500, { ok: false, error: "Internal server error." });
  }
});

