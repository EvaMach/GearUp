import { BASE_URI, DB_OPTIONS } from "../api/db";

interface SuccessResult<T> {
  success: true;
  status: number;
  data: T;
}

interface ErrorResult {
  success: false;
  status: number;
  error: string;
}

export const success = <T>(data: T, status: number = 200): SuccessResult<T> => ({ success: true, data, status });

export const error = (error: string, status: number = 500): ErrorResult => ({ success: false, error, status });

export type Result<T> = SuccessResult<T> | ErrorResult;

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export const fetchData = async <T>(
  URI: string,
  method: Method = 'GET',
  headers: Record<string, string> = {},
  body: string = ''
): Promise<Result<T>> => {
  const baseHeaders = {
    "Content-Type": "application/json",
  };
  try {
    const response = await fetch(URI, { method, headers: { ...baseHeaders, ...headers }, body });

    if (response.ok) {
      const payload = await response.json();
      return success(payload, response.status);
    }

    try {
      const payload = await response.json();
      return error(payload.errors, response.status);
    } catch (err) {
      console.error('Error parsing error response:', err);
      return error(`Failed to parse error response: ${err}`, 500);
    }

  } catch (err) {
    console.error('Error fetching data:', err);
    return error('Failed to fetch data', 500);
  };
};
