
import type { Context, Response } from "https://deno.land/x/oak@v16.0.0/mod.ts";
import { constructQuery, BASE_URI, type Query, MONGO_HEADERS } from "./db.ts";
import { fetchData } from "./utils.ts";

interface GearItem {
  _id: { $oid: string; };
  name: string;
  type: 'tent' | 'hotel' | 'all';
  group: string;
  amount: number;
}
export const errorHandler = async (ctx: Context, next: () => Promise<unknown>) => {
  try {
    await next();
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: "Internal Server Error: " + err };
  }
};

const fetchDocuments = async <T>(query: Query<T>, response: Response): Promise<void> => {
  const body = JSON.stringify(query);
  const result = await fetchData<GearItem[]>(`${BASE_URI}/find`, 'POST', MONGO_HEADERS, body);

  if (result.success) {
    response.status = result.status;
    response.body = result.data;
  } else {
    response.status = result.status;
    response.body = result.error;
  };
};

export const getGearList = async ({ response, request }: Context) => {
  const typeParam = request.url.searchParams.get('type');
  const query = constructQuery(typeParam ? { "type": { $in: [typeParam, "all"] } } : {});
  await fetchDocuments(query, response);
};

export const getOptions = async ({ response, request }: Context) => {
  const searchQuery = request.url.searchParams.get("q") || "";
  const query = constructQuery({ name: { $regex: searchQuery, $options: "i" } });
  await fetchDocuments(query, response);
};
