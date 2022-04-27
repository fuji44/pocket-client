export class PocketAuthClient {
  static async fetchRequestToken(
    consumerKey: string,
    redirectUri: string,
    state?: string,
  ): Promise<RequestTokenResult> {
    const headers = new Headers();
    headers.append("content-type", "application/json; charset=UTF8");
    headers.append("x-accept", "application/json");
    const request = new Request(
      "https://getpocket.com/v3/oauth/request",
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          consumer_key: consumerKey,
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

  static async fetchAccessToken(
    consumerKey: string,
    requestToken: string,
  ): Promise<AccessTokenResult> {
    const headers = new Headers();
    headers.append("content-type", "application/json; charset=UTF8");
    headers.append("x-accept", "application/json");
    const request = new Request(
      "https://getpocket.com/v3/oauth/authorize",
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          consumer_key: consumerKey,
          code: requestToken,
        }),
      },
    );
    const response = await fetch(request);
    const json = await response.json();
    return {
      accessToken: json.access_token,
      username: json.username,
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

export type AccessTokenResult = {
  accessToken: string;
  username: string;
};
