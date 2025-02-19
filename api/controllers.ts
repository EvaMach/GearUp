
import type { Context, Response } from "https://deno.land/x/oak@v16.0.0/mod.ts";
import { constructQuery, type Query } from "./db.ts";
import { fetchData } from "../sharedUtils/apiUtils.ts";
import { BASE_URI } from "./db.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
const { DATA_API_KEY } = await load();

interface GearItem {
  _id: { $oid: string; };
  name: string;
  type: 'tent' | 'hotel' | 'all';
  amount: number;
}
export const errorHandler = async (ctx: Context, next: () => Promise<unknown>) => {
  try {
    await next();
  } catch (err) {
    console.error("Unhandled Error:", err);
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: "Internal Server Error" };
  }
};

const fetchDocuments = async <T>(query: Query<T>, response: Response): Promise<void> => {
  const body = JSON.stringify(query);
  const result = await fetchData<GearItem[]>(`${BASE_URI}/find`, 'POST', { "api-key": DATA_API_KEY }, body);

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
