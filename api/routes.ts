import { Router } from "https://deno.land/x/oak@v16.0.0/mod.ts";
import { getGearList, getOptions } from "./controllers.ts";

const router = new Router();

router
  .get("/api/gear", getGearList)
  .get("/api/options", getOptions);

export default router;