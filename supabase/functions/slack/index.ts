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

export const verify = (token1: string, token2: string) => {
  if (token1 !== token2) {
    throw new Error("token mismatch");
  }
};

export const callback = async (
  event: SlackEvent,
  endpoint: string,
  key: string,
) => {
  console.log(event.type);
  const pattern = /http(.*):\/\/([a-zA-Z0-9/\-\_\.]*)/;
  try {
    const url = event.event.text.match(pattern)?.find((s) => s);
    console.log(url);

    const init = {
      body: JSON.stringify({ url: url }),
      method: "POST",
      headers: {
        "X-API-KEY": key,
        "Content-Type": "application/json",
      },
    };
    const res = await fetch(endpoint, init);

    console.debug(res);
  } catch (e) {
    console.warn(e);
    // 不要なリトライを防ぐため握りつぶす
    return;
  }
};

serve(async (request: { json: () => any }) => {
  const req = await request.json();

  const event: SlackEvent = JSON.parse(JSON.stringify(req));

  console.debug(JSON.stringify(event));

  verify(event.token, env.VERIFICATION_TOKEN);

  if (event.type === "url_verification") {
    return new Response(JSON.stringify(event.challenge));
  }

  console.info(
    `received event type: ${event.type}, sub type: ${event.event.subtype}`,
  );

  if (
    event.type === "event_callback" && event.event.subtype === "message_changed"
  ) {
    return new Response(JSON.stringify(""));
  }

  if (event.type === "event_callback") {
    callback(event, env.CORE_APP_ENDPOINT_V1_ARTICLE_SHARE, env.API_KEY);
  }

  return new Response(
    JSON.stringify(""),
    { headers: { "Content-Type": "application/json" } },
  );
});
