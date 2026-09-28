import {
  createApi,
  fetchBaseQuery,
  type BaseQueryApi,
  type FetchArgs,
} from '@reduxjs/toolkit/query/react';
import { jwtDecode } from 'jwt-decode';
import { API } from '../config/env';
import { logout } from '../features/auth/authSlice';
import { addToast } from '@heroui/react';

interface JWTPayload {
  exp: number;
}

interface StateWithAuth {
  auth: {
    token: string | null;
  };
}

const buildErrorMessage = (backendError: any, status?: number | string) => {
  const baseMessage =
    backendError?.errorCode?.message ||
    backendError?.messageType ||
    backendError?.message ||
    backendError?.error ||
    (typeof backendError === 'string' ? backendError : undefined) ||
    (typeof status === 'number' ? `Error ${status} del servidor` : 'Ocurrió un error');

  if (backendError?.errors && typeof backendError.errors === 'object') {
    const detalles = Object.entries(backendError.errors)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join('\n');
    return { title: baseMessage, description: detalles };
  }

  return { title: baseMessage, description: undefined };
};

const baseQuery = fetchBaseQuery({
  baseUrl: API,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as StateWithAuth).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithInterceptor = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: {}
) => {
  const token = (api.getState() as StateWithAuth).auth.token;

  if (token) {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        console.warn('El token ha expirado.');
        api.dispatch(logout());
        window.location.href = '/';
        return {
          error: { status: 401, data: { message: 'Sesión expirada' } },
        };
      }
    } catch {
      console.error('Token corrupto.');
      api.dispatch(logout());
      window.location.href = '/';
      return {
        error: { status: 401, data: { message: 'Token inválido' } },
      };
    }
  }

  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    const status = result.error.status;
    const backendError = result.error.data;

    if (status === 401 && api.endpoint !== 'login') {
      console.warn('Servidor rechazó el token (401)');
      api.dispatch(logout());

      addToast({
        title: 'Sesión expirada',
        description: 'Vuelve a iniciar sesión',
        color: 'danger',
        variant: 'bordered',
      });

      window.location.href = '/';
      return result;
    }

    if (status === 'FETCH_ERROR') {
      addToast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor',
        color: 'danger',
        variant: 'bordered',
      });
    } else {
      const errorStatus = status === 'PARSING_ERROR'
        ? result.error.originalStatus
        : status;
      const { title, description } = buildErrorMessage(backendError, errorStatus);

      addToast({
        title,
        description,
        color: 'danger',
        variant: 'bordered',
      });

      api.dispatch({
        type: 'error/setError',
        payload: backendError,
      });
    }
  } else if (api.type === 'mutation' && api.endpoint !== 'login') {
    const status = result.meta?.response?.status;

    if (status !== undefined && status >= 200 && status < 300) {
      const responseData = result.data as { message?: unknown; mensaje?: unknown } | undefined;
      const message = responseData?.message ?? responseData?.mensaje;

      addToast({
        title: 'Operación exitosa',
        description: typeof message === 'string' ? message : 'La operación se completó correctamente',
        color: 'success',
        variant: 'bordered',
      });
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithInterceptor,
  tagTypes: [
    'User',
    'WaterMeters',
    'MyWaterMeters',
    'WaterMeter',
    'MeterModels',
    'MeterModel',
    'MeterBrands',
    'MeterBrand',
    'MeterTypes',
    'MeterType',
    'Companies',
    'Company',
    'MyCompany',
    'AvailableCompanies',
    'NetworkTechnologies',
    'NetworkTechnology',
    'Sensors',
    'Sensor',
    'Reading',
    'Readings',
    'Commands',
    'Command',
    'SensorInstallations',
    'SensorInstallationsHistory',
    'SensorInstallationHistory',
    'WaterMeterInstallation',
    'WaterMeterInstallationHistory',
    'ConfigAlerts',
    'ConfigAlert',
    'Attachments',
    'Alertas',
    'Alerta',
    'Devices',
    'Device',
    'WaterMeterReadings',
    'Routes',
    'Route',
    'Geofences'
  ] as const,
  endpoints: () => ({}),
});

export type TagTypes =
  | 'User'
  | 'WaterMeters'
  | 'MyWaterMeters'
  | 'WaterMeter';