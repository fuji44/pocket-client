import { Command } from "cliffy/command/mod.ts";
import { PocketAuthClient } from "./src/pocket.ts";

async function servePocketAuthCallback(
  conn: Deno.Conn,
  consumerKey: string,
  requestToken: string,
  state: string,
) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
    const result = await PocketAuthClient.fetchAccessToken(
      consumerKey,
      requestToken,
    );
    console.log("User authentication was successful!!\n");
    console.log(`Access Token: ${result.accessToken}`);
    console.log(`Username: ${result.username}`);
    console.log(`State: ${state}`);

    const body =
      "User authentication was successful!!\nThe access token was output to the console.\n\nPlease close this window.";
    await requestEvent.respondWith(new Response(body, { status: 200 }));
    Deno.exit(0);
  }
}

const authCommand = new Command()
  .description("Authenticate and obtain an access token.")
  .option(
    "-c, --consumer-key <consumerKey:string>",
    "The consumer key for your application",
  )
  .option(
    "-s, --state <string>",
    "A string of metadata used by your application",
  )
  .env(
    "POCKET_CONSUMER_KEY=<consumerKey:string>",
    "The consumer key for your application",
    { required: false, prefix: "POCKET_" },
  )
  .env(
    "PORT=<port:number>",
    "HTTP server port for receiving authentication callbacks from Pocket",
    { required: false },
  )
  .action(async (options) => {
    const consumerKey = options.consumerKey;
    if (!consumerKey) {
      console.error(
        "Consumer key is required. It must be specified with the environment variable POCKET_CONSUMER_KEY or the option -c.",
      );
      Deno.exit(1);
    }
    const state = options.state || crypto.randomUUID();
    const port = options.port || 3000;

    const result = await PocketAuthClient.fetchRequestToken(
      consumerKey,
      `http://localhost:${port}/`,
      state,
    );

    console.log(
      "Please access the following URL with your browser for authorization.\n",
    );
    console.log(result.authorizationUrl);

    const server = Deno.listen({ port });
    for await (const conn of server) {
      servePocketAuthCallback(conn, consumerKey, result.code, state);
    }
  });

await new Command()
  .name("pocket")
  .version("0.1.0")
  .description("This is a Pocket API Client based on Deno.")
  .command("auth", authCommand)
  .parse(Deno.args);
