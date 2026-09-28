import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "./services/authApi";
import type { UserAPIType } from "./services/loginService";

interface AuthState {
  user: Omit<UserAPIType, "accessToken" | "tokenType"> | null;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
}

function decodeToken(token: string): Record<string, any> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    console.error("Error decodificando token:", e);
    return null;
  }
}

function buildUserFromToken(token: string): Omit<UserAPIType, "accessToken" | "tokenType"> | null {
  const payload = decodeToken(token);
  if (!payload) return null;

  const {
    sub,
    id,
    uuid,
    roles,
    email,
    time_zone,
    company_id,
    project_id,
    views,
  } = payload;

  return {
    sub,
    id,
    uuid,
    roles: roles ?? [],
    email,
    time_zone,
    company_id,
    project_id,
    views: views ?? [],
  } as unknown as Omit<UserAPIType, "accessToken" | "tokenType">;
}

const getStoredAuth = () => {
  if (typeof window === "undefined") {
    return { token: null, user: null, isAuthenticated: false };
  }

  const storedToken = localStorage.getItem("token");
  const storedUserRaw = localStorage.getItem("user");

  let user: any = null;
  try {
    user = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  } catch {
    user = null;
  }

  if (storedToken && (!user || Object.keys(user).length === 0)) {
    user = buildUserFromToken(storedToken);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }

  return {
    token: storedToken,
    isAuthenticated: !!storedToken,
    user,
  };
};

const persistAuth = (state: AuthState) => {
  if (typeof window === "undefined") return;

  if (state.token) {
    localStorage.setItem("token", state.token);
    localStorage.setItem("user", JSON.stringify(state.user));
  } else {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

const initialState: AuthState = {
  ...getStoredAuth(),
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      persistAuth(state);
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    hydrateUserFromToken: (state) => {
      if (state.token) {
        const user = buildUserFromToken(state.token);
        if (user) {
          state.user = user;
          persistAuth(state);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        const { accessToken } = action.payload;

        state.token = accessToken;
        state.isAuthenticated = true;
        state.error = null;

        const userFromToken = buildUserFromToken(accessToken);
        state.user = userFromToken ?? null;

        persistAuth(state);
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error =
          (action.payload as { error?: string } | undefined)?.error ??
          action.error.message ??
          "No se pudo iniciar sesión.";

        persistAuth(state);
      });
  },
});

export const {
  clearAuthError,
  logout,
  setAuthError,
  hydrateUserFromToken,
} = authSlice.actions;
export default authSlice.reducer;