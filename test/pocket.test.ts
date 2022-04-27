import { assertEquals, fail } from "std/testing/asserts.ts";
import { PocketAuthClient } from "../src/pocket.ts";

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
    result.authorizationUrl,
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
    result.authorizationUrl,
    `https://getpocket.com/auth/authorize?request_token=${result.code}&redirect_uri=http://localhost:3000/dummy/callback`,
  );
});
