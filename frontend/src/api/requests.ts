import type { AppRequestsType } from 'backend/modules/requests/index';
import { config } from 'config';
import { hc } from 'hono/client';
import { clientConfig, handleResponse } from '.';

// Create Hono clients to make requests to the backend
export const client = hc<AppRequestsType>(config.backendUrl, clientConfig).requests;

type CreateRequestProp = Parameters<(typeof client)['$post']>['0']['json'];

// Request access or request info
export const createRequest = async (requestInfo: CreateRequestProp) => {
  const response = await client.$post({
    json: requestInfo,
  });

  await handleResponse(response);
};

export type GetRequestsParams = Partial<
  Omit<Parameters<(typeof client)['$get']>['0']['query'], 'limit' | 'offset'> & {
    limit?: number;
    offset?: number;
    page?: number;
  }
>;

export const getRequests = async ({ q, sort = 'id', order = 'asc', page = 0, limit = 50, offset }: GetRequestsParams = {}, signal?: AbortSignal) => {
  const response = await client.$get(
    {
      query: {
        q,
        sort,
        order,
        offset: typeof offset === 'number' ? String(offset) : String(page * limit),
        limit: String(limit),
      },
    },
    {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        return fetch(input, {
          ...init,
          credentials: 'include',
          signal,
        });
      },
    },
  );

  const json = await handleResponse(response);
  return json.data;
};
