import { CobaltClient } from "../src/index.ts";
import "@std/dotenv/load";

const apiEndpoint = Deno.env.get("COBALT_API");
if (!apiEndpoint) {
  throw new Error("COBALT_API environment variable is not set");
}
const client = new CobaltClient(apiEndpoint);

console.log(apiEndpoint);

try {
  const res = await client.process({
    url: "_",
    filenameStyle: "nerdy",
  });
  console.log(res);
} catch (error) {
  console.log(error);
}
