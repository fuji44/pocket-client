import { assertEquals, fail } from "std/testing/asserts.ts";
import { PocketAuthClient, PocketClient } from "../src/pocket.ts";

Deno.test("Fetch request token", async () => {
  const consumerKey = Deno.env.get("POCKET_CONSUMER_KEY");
  if (!consumerKey) {
    fail(
      "The environment variable POCKET_CONSUMER_KEY must be set in order to perform the test.",
    );
  }

  const result = await PocketAuthClient.fetchRequestToken(
    consumerKey,
    "http://localhost:3000/dummy/callback",
  );
  assertEquals(result.code.length, 30);
  assertEquals(result.state, null);
  assertEquals(
    result.authorization_url,
    `https://getpocket.com/auth/authorize?request_token=${result.code}&redirect_uri=http://localhost:3000/dummy/callback`,
  );
});

Deno.test("Fetch request token | set state", async () => {
  const consumerKey = Deno.env.get("POCKET_CONSUMER_KEY");
  if (!consumerKey) {
    fail(
      "The environment variable POCKET_CONSUMER_KEY must be set in order to perform the test.",
    );
  }

  const result = await PocketAuthClient.fetchRequestToken(
    consumerKey,
    "http://localhost:3000/dummy/callback",
    "dummy state",
  );
  assertEquals(result.code.length, 30);
  assertEquals(result.state, "dummy state");
  assertEquals(
    result.authorization_url,
    `https://getpocket.com/auth/authorize?request_token=${result.code}&redirect_uri=http://localhost:3000/dummy/callback`,
  );
});

Deno.test("Get Items | No options", async () => {
  const consumerKey = Deno.env.get("POCKET_CONSUMER_KEY");
  if (!consumerKey) {
    fail(
      "The environment variable POCKET_CONSUMER_KEY must be set in order to perform the test.",
    );
  }
  const accessToken = Deno.env.get("POCKET_ACCESS_TOKEN");
  if (!accessToken) {
    fail(
      "The environment variable POCKET_ACCESS_TOKEN must be set in order to perform the test.",
    );
  }

  const client = new PocketClient(consumerKey, accessToken);
  const result = await client.getItems({ count: 1, detailType: "complete" });
  assertEquals(result.status, 1);
  assertEquals(Object.keys(result.list).length, 1);
});
