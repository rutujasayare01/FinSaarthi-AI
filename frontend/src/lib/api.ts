const API_BASE = "/api";

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("finsaarthi_token") : null;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = `HTTP Error ${res.status}`;
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errorDetail;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  auth: {
    demoLogin: (role: "CITIZEN" | "OFFICIAL" | "ADMIN" | "DEVELOPER") =>
      apiRequest(`/auth/demo-login/${role}`, { method: "POST" }),
    getMe: () => apiRequest("/auth/me"),
  },
  schemes: {
    list: (category?: string, state?: string) => {
      const params = new URLSearchParams();
      if (category && category !== "All") params.append("category", category);
      if (state && state !== "All") params.append("state", state);
      return apiRequest(`/schemes?${params.toString()}`);
    },
    getById: (id: number | string) => apiRequest(`/schemes/${id}`),
    create: (data: any) => apiRequest("/schemes", { method: "POST", body: JSON.stringify(data) }),
  },
  eligibility: {
    checkSingle: (schemeId: number | string) => apiRequest(`/eligibility/check/${schemeId}`),
    batch: () => apiRequest("/eligibility/batch"),
    summary: () => apiRequest("/eligibility/summary"),
    quickCheck: (profileData: any) =>
      apiRequest("/eligibility/quick-check", {
        method: "POST",
        body: JSON.stringify(profileData),
      }),
  },
  users: {
    getProfile: () => apiRequest("/users/profile"),
    updateProfile: (data: any) =>
      apiRequest("/users/profile", { method: "PUT", body: JSON.stringify(data) }),
    getSavedSchemes: () => apiRequest("/users/saved-schemes"),
    saveScheme: (schemeId: number) => apiRequest(`/users/saved-schemes/${schemeId}`, { method: "POST" }),
    unsaveScheme: (schemeId: number) => apiRequest(`/users/saved-schemes/${schemeId}`, { method: "DELETE" }),
  },
  documents: {
    list: () => apiRequest("/documents"),
    upload: (formData: FormData) => apiRequest("/documents/upload", { method: "POST", body: formData }),
    delete: (id: number) => apiRequest(`/documents/${id}`, { method: "DELETE" }),
  },
  search: {
    query: (text: string, language: string = "en", state?: string) =>
      apiRequest("/search", {
        method: "POST",
        body: JSON.stringify({ query: text, language, state }),
      }),
  },
  assistant: {
    chat: (message: string, language: string = "en") =>
      apiRequest("/assistant/chat", {
        method: "POST",
        body: JSON.stringify({ message, language }),
      }),
  },
  notifications: {
    list: (unreadOnly: boolean = false) => apiRequest(`/notifications?unread_only=${unreadOnly}`),
    markRead: (id: number) => apiRequest(`/notifications/${id}/read`, { method: "PUT" }),
    markAllRead: () => apiRequest("/notifications/read-all", { method: "PUT" }),
    triggerDemoAlert: () => apiRequest("/notifications/trigger-demo-alert", { method: "POST" }),
  },
  analytics: {
    getOverview: () => apiRequest("/analytics/overview"),
    track: (eventType: string, properties?: any) =>
      apiRequest("/analytics/track", {
        method: "POST",
        body: JSON.stringify({ event_type: eventType, properties }),
      }),
  },
  translations: {
    translate: (text: string, source_lang: string, target_lang: string) =>
      apiRequest("/translations/translate", {
        method: "POST",
        body: JSON.stringify({ text, source_language: source_lang, target_language: target_lang }),
      }),
    transcribe: (formData: FormData) =>
      apiRequest("/translations/transcribe", { method: "POST", body: formData }),
  },
};
