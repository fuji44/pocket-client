import { assertEquals } from "std/testing/asserts.ts";
import { PocketClient } from "../src/pocket.ts";

Deno.test("Create Instance", () => {
  const client = new PocketClient("dummy");
  assertEquals(client.consumerKey, "dummy");
});
