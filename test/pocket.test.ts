import { assertEquals, fail } from "std/testing/asserts.ts";
import { PocketClient } from "../src/pocket.ts";

Deno.test("Create Instance", () => {
  const client = new PocketClient("dummy");
  assertEquals(client.consumerKey, "dummy");
});

Deno.test("Fetch request token", async () => {
  const consumerKey = Deno.env.get("POCKET_CONSUMER_KEY");
  if (!consumerKey) {
    fail(
      "The environment variable POCKET_CONSUMER_KEY must be set in order to perform the test.",
    );
  }

  const client = new PocketClient(consumerKey);
  assertEquals(client.consumerKey, consumerKey);

  const requestToken = await client.fetchRequestToken(
    "http://localhost:3000/dummy/callback",
  );
  assertEquals(requestToken.code.length, 30);
  assertEquals(requestToken.state, null);
});

Deno.test("Fetch request token | set state", async () => {
  const consumerKey = Deno.env.get("POCKET_CONSUMER_KEY");
  if (!consumerKey) {
    fail(
      "The environment variable POCKET_CONSUMER_KEY must be set in order to perform the test.",
    );
  }

  const client = new PocketClient(consumerKey);
  assertEquals(client.consumerKey, consumerKey);

  const result = await client.fetchRequestToken(
    "http://localhost:3000/dummy/callback",
    "dummy state",
  );
  assertEquals(result.code.length, 30);
  assertEquals(result.state, "dummy state");
});
