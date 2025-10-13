import { CobaltClient } from "../index.ts";
import "@std/dotenv/load";

const apiEndpoint = Deno.env.get("COBALT_API");
if (!apiEndpoint) {
  throw new Error("COBALT_API environment variable is not set");
}
const client = new CobaltClient(apiEndpoint);

console.log(apiEndpoint);

const res = await client.process({
  url: "_",
  filenameStyle: "nerdy",
});

console.log(res);

// if (file) {
//   if (response.filename) {
//     await Deno.writeFile(response.filename, new Uint8Array(file));
//     console.log(`File saved as: ${response.filename}`);
//   } else {
//     throw new Error("No filename available in response");
//   }
// }
