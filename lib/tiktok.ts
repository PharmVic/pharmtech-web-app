"use server";

export const TIKTOK_PIXEL_ID = "D75UG83C77U0P1Q07MP0";
const TIKTOK_ACCESS_TOKEN = "4ce4caba3be12f743053739ad369a0bed6aa55e5";

type TikTokEvent = "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";

export interface TikTokEventData {
  event: TikTokEvent;
  event_id?: string;
  user?: {
    email?: string;
    phone?: string;
    external_id?: string;
    ttp?: string; // TikTok Cookie Payer
    ttclid?: string; // TikTok Click ID
    client_ip_address?: string;
    client_user_agent?: string;
  };
  properties?: {
    value?: number;
    currency?: string;
    content_id?: string;
    content_type?: string;
    content_name?: string;
    contents?: Array<{
      content_id?: string;
      content_name?: string;
      quantity?: number;
      price?: number;
    }>;
  };
  page?: {
    url?: string;
    referrer?: string;
  };
}

export async function sendTikTokEvent(eventData: TikTokEventData) {
  try {
    const payload = {
      event_source: "web",
      event_source_id: TIKTOK_PIXEL_ID,
      data: [
        {
          event: eventData.event,
          event_time: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
          event_id: eventData.event_id || crypto.randomUUID(),
          user: eventData.user || {},
          properties: eventData.properties || {},
          page: eventData.page || {},
        },
      ],
    };

    const response = await fetch(
      "https://business-api.tiktok.com/open_api/v1.3/event/track/",
      {
        method: "POST",
        headers: {
          "Access-Token": TIKTOK_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    console.log("TikTok Event Tracked:", eventData.event, result);
    return result;
  } catch (error) {
    console.error("TikTok Event Tracking Error:", error);
    return null;
  }
}
