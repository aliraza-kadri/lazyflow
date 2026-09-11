import { siteConfig } from "@/config/site";

/**
 * Builds a wa.me deep link with a pre-filled message.
 * Centralised so the WhatsApp number only needs to change in one place
 * (src/config/site.ts).
 */
export function buildWhatsAppLink(message: string, number: string = siteConfig.whatsappNumber) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

export const whatsappMessages = {
  automateMyBusiness:
    "Hi LazyFlow, I want to automate my business. Can we talk?",
  talkToUs: "Hi LazyFlow, I'd like to know more about how you work.",
  findAutomation:
    "Hi LazyFlow, here's what's slowing my business down — I'd like your suggestion on automating it.",
};
