import { Command, EnumType } from "cliffy/command/mod.ts";
import {
  contentTypeArray,
  detailTypeArray,
  favoriteArray,
  PocketAuthClient,
  PocketClient,
  sortArray,
  stateArray,
} from "./src/pocket.ts";

async function servePocketAuthCallback(
  conn: Deno.Conn,
  consumerKey: string,
  requestToken: string,
  state: string,
) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
    // TODO: validate state
    const result = await PocketAuthClient.fetchAccessToken(
      consumerKey,
      requestToken,
    );
    console.log("\nUser authentication was successful!!\n");
    console.log({
      ...result,
      state,
    });

    const body = `User authentication was successful!!
The access token was output to the console.

Please close this window.`;
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
    "-s, --state <state:string>",
    "A string of metadata used by your application",
  )
  .option(
    "-p, --port <port:number>",
    "HTTP server port for receiving authentication callbacks from Pocket. If not specified, port 3000 is used.",
  )
  .env(
    "POCKET_CONSUMER_KEY=<consumerKey:string>",
    "The consumer key for your application",
    { required: false, prefix: "POCKET_" },
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
    console.log(result.authorization_url);

    const server = Deno.listen({ port });
    for await (const conn of server) {
      servePocketAuthCallback(conn, consumerKey, result.code, state);
    }
  });

const state = new EnumType(stateArray);
const favorite = new EnumType(favoriteArray);
const contentType = new EnumType(contentTypeArray);
const sort = new EnumType(sortArray);
const detailType = new EnumType(detailTypeArray);
const getCommand = new Command()
  .description("Retrieve items stored in Pocket.")
  .type("state", state)
  .type("favorite", favorite)
  .type("contentType", contentType)
  .type("sort", sort)
  .type("detailType", detailType)
  .option(
    "-c, --consumer-key <consumerKey:string>",
    "The consumer key for your application",
  )
  .option(
    "-a, --access-token <accessToken:string>",
    "The access token for your application",
  )
  .option(
    "-s, --state <value:state>",
    "unread (default): only return unread items. archive: only return archived items. all: return both unread and archived items.",
  )
  .option(
    "-f --favorite <value:favorite>",
    "0: only return un-favorited items. 1: only return favorited items.",
  )
  .option(
    "-t, --tag <tag:string>",
    "tag_name: only return items tagged with tag_name. _untagged_: only return untagged items.",
  )
  .option(
    "--content-type <value:contentType>",
    "article: only return articles. video: only return videos or articles with embedded videos. image: only return images.",
  )
  .option(
    "--sort <value:sort>",
    "newest: return items in order of newest to oldest. oldest: return items in order of oldest to newest. title: return items in order of title alphabetically. site: return items in order of url alphabetically.",
  )
  .option(
    "-d, --detail-type <value:detailType>",
    "simple (default): return basic information about each item, including title, url, status, and more. complete: return all data about each item, including tags, images, authors, videos, and more.",
  )
  .option(
    "--search <value:string>",
    "Only return items whose title or url contain the search string.",
  )
  .option(
    "--domain <value:string>",
    "Only return items from a particular domain",
  )
  .option(
    "--since <value:integer>",
    "Only return items modified since the given since unix timestamp.",
  )
  .option(
    "--count <value:integer>",
    "Only return count number of items.",
  )
  .option(
    "--offset <value:integer>",
    "Used only with count; start returning from offset position of results.",
  )
  .action(async (options) => {
    const consumerKey = options.consumerKey;
    if (!consumerKey) {
      console.error(
        "Consumer key is required. It must be specified with the option -c.",
      );
      Deno.exit(1);
    }
    const accessToken = options.accessToken;
    if (!accessToken) {
      console.error(
        "Access token is required. It must be specified with the option -a.",
      );
      Deno.exit(1);
    }
    const client = new PocketClient(consumerKey, accessToken);

    const items = await client.getItems({
      state: options.state,
      favorite: options.favorite,
      tag: options.tag,
      contentType: options.contentType,
      sort: options.sort,
      detailType: options.detailType,
      search: options.search,
      domain: options.domain,
      since: options.since,
      count: options.count,
      offset: options.offset,
    });
    console.log(JSON.stringify(items));
  });

await new Command()
  .name("pocket")
  .version("0.1.0")
  .description("This is a Pocket API Client based on Deno.")
  .command("auth", authCommand)
  .command("get", getCommand)
  .parse(Deno.args);
