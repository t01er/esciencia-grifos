import { apiSlice } from "../../../app/apiSlice";
import { API } from "../../../config/env";
import type { LoginCredentials, UserAPIType } from "./loginService";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<UserAPIType, LoginCredentials>({
      query: ({ email, password }) => ({
        url: `${API}/api/v1/auth/login`,
        method: "POST",
        body: { email, password },
      }),
      transformResponse: (data: any): UserAPIType => {
        if (!data?.token) {
          throw new Error("No se recibió el token de autenticación.");
        }

        return {
          id: data.id ?? 0,
          username: data.username ?? "",
          roles: data.roles ?? [],
          opciones: data.opciones ?? [],
          distribuidoresPermitidos: data.distribuidoresPermitidos ?? [],
          accessToken: data.token,
          refreshToken: data.refresh_token,
          expiration: data.expiration,
          tokenType: "Bearer",
        };
      },
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation } = authApi;
