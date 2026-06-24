export const storefrontConfig = {
  baseUrl: (import.meta.env.VITE_PUBLIC_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, ""),
  apiKey: import.meta.env.VITE_PUBLIC_API_KEY || "",
  tenant: import.meta.env.VITE_PUBLIC_TENANT || "",
  adminToken: import.meta.env.VITE_PUBLIC_AUTH_TOKEN || "",
  whatsappNumber: import.meta.env.VITE_PUBLIC_WHATSAPP_NUMBER || "254700000000"
};
