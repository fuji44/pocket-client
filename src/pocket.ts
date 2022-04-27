export class PocketClient {
  constructor(readonly consumerKey: string) {
    if (!consumerKey) {
      throw new Error("Pocket API consumer key is required");
    }
  }

  async fetchRequestToken(
    redirectUri: string,
    state?: string,
  ): Promise<RequestTokenResult> {
    const headers = new Headers();
    headers.append("content-type", "application/json; charset=UTF8");
    headers.append("x-accept", "application/json");
    const request = new Request(
      `https://getpocket.com/v3/oauth/request`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          consumer_key: this.consumerKey,
          redirect_uri: redirectUri,
          state,
        }),
      },
    );
    const response = await fetch(request);
    const json = await response.json();
    return {
      ...json,
      authorizationUrl:
        `https://getpocket.com/auth/authorize?request_token=${json.code}&redirect_uri=${redirectUri}`,
    };
  }
}

export type RequestTokenResult = {
  /** Request Token */
  code: string;
  /**
   * A string of metadata used by your app.
   *
   * This string will be returned in all subsequent authentication responses.
   */
  state?: string;
  /**
   * URL to continue authentication.
   *
   * A browser request must be made to this URL to obtain authorization from the user.
   */
  authorizationUrl: string;
};
