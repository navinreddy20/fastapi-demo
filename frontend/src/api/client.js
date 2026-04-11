import axios from "axios";

const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

const baseURL = process.env.REACT_APP_API_URL || "";

/** Plain client for refresh (no Authorization header, no retry loop). */
const bare = axios.create({ baseURL });

export const api = axios.create({ baseURL });

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(payload) {
  if (payload.access_token) {
    localStorage.setItem(TOKEN_KEY, payload.access_token);
  }
  if (payload.refresh_token) {
    localStorage.setItem(REFRESH_KEY, payload.refresh_token);
  }
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function parseJwtPayload(token) {
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const t = getAccessToken();
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

let refreshPromise = null;

export async function refreshAccessToken() {
  const r = getRefreshToken();
  if (!r) throw new Error("No refresh token");
  if (!refreshPromise) {
    refreshPromise = bare
      .post("/auth/refresh", { refresh_token: r })
      .then(({ data }) => {
        if (data.access_token) {
          localStorage.setItem(TOKEN_KEY, data.access_token);
        }
        return data.access_token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    if (!config || config._skipAuthRetry) {
      return Promise.reject(error);
    }
    const url = config.url || "";
    if (response?.status === 401 && !config._retry && !url.includes("/auth/login") &&
        !url.includes("/auth/signup") && !url.includes("/auth/refresh")) {
      config._retry = true;
      try {
        await refreshAccessToken();
        return api(config);
      } catch {
        clearTokens();
      }
    }
    return Promise.reject(error);
  }
);

export function formatApiError(err) {
  const d = err.response?.data?.detail;
  if (d == null) return err.message || "Request failed";
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((e) => e.msg || JSON.stringify(e)).join(". ");
  return "Request failed";
}
