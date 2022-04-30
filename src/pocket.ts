export class PocketAuthClient {
  static async fetchRequestToken(
    consumer_key: string,
    redirect_uri: string,
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
          consumer_key: consumer_key,
          redirect_uri: redirect_uri,
          state,
        }),
      },
    );
    const response = await fetch(request);
    const json = await response.json();
    return {
      ...json,
      authorization_url:
        `https://getpocket.com/auth/authorize?request_token=${json.code}&redirect_uri=${redirect_uri}`,
    };
  }

  static async fetchAccessToken(
    consumer_key: string,
    request_token: string,
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
          consumer_key: consumer_key,
          code: request_token,
        }),
      },
    );
    const response = await fetch(request);
    const json = await response.json();
    return {
      access_token: json.access_token,
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
  authorization_url: string;
};

export type AccessTokenResult = {
  access_token: string;
  username: string;
};
