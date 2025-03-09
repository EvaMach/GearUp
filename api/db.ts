import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
const { APP_ID, DATA_API_KEY } = await load();

export const BASE_URI = `https://eu-central-1.aws.data.mongodb-api.com/app/${APP_ID}/endpoint/data/v1/action`;
const DATA_SOURCE = "Cluster0";
const DATABASE = "gearup_db";
const COLLECTION = "gear";

export interface Query<T> {
  collection: string;
  database: string;
  dataSource: string;
  filter: T;
  limit?: number;
}

export const MONGO_HEADERS = {
  "Content-Type": "application/json",
  "api-key": DATA_API_KEY
};

export const constructQuery = <T>(filter: T, limit?: number): Query<T> => {
  return {
    collection: COLLECTION,
    database: DATABASE,
    dataSource: DATA_SOURCE,
    filter,
    limit,
  };
};
