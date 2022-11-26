import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

export type Env = {
  API_KEY: string;
  VERIFICATION_TOKEN: string;
  CORE_APP_ENDPOINT_V1_ARTICLE_SHARE: string;
};

export type SlackEventType = "url_verification" | "event_callback";

export type SlackEvent = {
  token: string;
  challenge: string;
  type: SlackEventType;
  event: Event;
};

export type EventType = "message";

export type EventSubType = "message_changed";

export type Event = {
  type: EventType;
  subtype: EventSubType;
  text: string;
  user: string;
  ts: number;
};

const env: Env = {
  API_KEY: Deno.env.get("API_KEY") ?? "",
  VERIFICATION_TOKEN: Deno.env.get("VERIFICATION_TOKEN") ?? "",
  CORE_APP_ENDPOINT_V1_ARTICLE_SHARE: Deno.env.get(
    "CORE_APP_ENDPOINT_V1_ARTICLE_SHARE",
  ) ?? "",
};

serve(async (request: { json: () => any }) => {
  const req = await request.json();

  const event: SlackEvent = JSON.parse(JSON.stringify(req));

  console.debug(JSON.stringify(event));

  if (event.type === "url_verification") {
    return new Response(JSON.stringify(event.challenge));
  }

  console.info(
    `received event type: ${event.type}, sub type: ${event.event.subtype}`,
  );

  return new Response(
    JSON.stringify(""),
    { headers: { "Content-Type": "application/json" } },
  );
});
