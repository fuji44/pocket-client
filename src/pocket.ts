function validateResponse(response: Response) {
  if (!response.ok) {
    const x_error = [];
    const x_error_code = response.headers.get("x-error-code");
    if (x_error_code) {
      x_error.push(x_error_code);
    }
    const x_error_text = response.headers.get("x-error");
    if (x_error_text) {
      x_error.push(x_error_text);
    }
    // TODO: Individual error handling
    throw new Error(JSON.stringify({
      http_status: `${response.status} ${response.statusText}`,
      x_error: x_error.join(" "),
    }));
  }
}

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
    validateResponse(response);
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

export class PocketClient {
  constructor(readonly consumer_key: string, readonly access_token: string) {
    if (!consumer_key) {
      throw new Error("Pocket API consumer key is required");
    }
    if (!access_token) {
      throw new Error("Pocket API access token is required");
    }
  }

  async getItems(options?: GetItemsOptions): Promise<GetItemsResult> {
    const headers = new Headers();
    headers.append("content-type", "application/json; charset=UTF8");
    headers.append("x-accept", "application/json");
    const request = new Request(
      `https://getpocket.com/v3/get`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          consumer_key: this.consumer_key,
          access_token: this.access_token,
          ...options,
        }),
      },
    );
    // TODO: Response, Status, and Error Codes https://getpocket.com/developer/docs/errors
    const response = await fetch(request);
    validateResponse(response);
    return await response.json();
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

export const stateArray = ["unread", "archive", "all"] as const;
export type State = typeof stateArray[number];
export function isState(obj: unknown): obj is State {
  return obj === "unread" || obj === "archive" || obj === "all";
}

export const contentTypeArray = ["article", "video", "image"] as const;
export type ContentType = typeof contentTypeArray[number];
export function isContentType(obj: unknown): obj is ContentType {
  return obj === "article" || obj === "video" || obj === "image";
}

export const sortArray = ["newest", "oldest", "title", "site"] as const;
export type Sort = typeof sortArray[number];
export function isSort(obj: unknown): obj is Sort {
  return obj === "newest" || obj === "oldest" || obj === "title" ||
    obj === "site";
}

export const detailTypeArray = ["simple", "complete"] as const;
export type DetailType = typeof detailTypeArray[number];
export function isDetailType(obj: unknown): obj is DetailType {
  return obj === "simple" || obj === "complete";
}

export type Tag = string | "_untagged_";
export function isTag(obj: unknown): obj is Tag {
  return obj === "_untagged_" || typeof obj === "string";
}

export const favoriteArray = ["0", "1"] as const;
export type Favorite = typeof favoriteArray[number];
export function isFavorite(obj: unknown): obj is Favorite {
  return obj === "0" || obj === "1";
}

export const statusArray = ["0", "1", "2"] as const;
export type Status = typeof statusArray[number];
export function isStatus(obj: unknown): obj is Status {
  return obj === "0" || obj === "1" || obj === "2";
}

export type GetItemsOptions = {
  state?: State;
  favorite?: Favorite;
  tag?: Tag;
  contentType?: ContentType;
  sort?: Sort;
  detailType?: DetailType;
  /** Only return items whose title or url contain the search string */
  search?: string;
  /** Only return items from a particular domain */
  domain?: string;
  /** Only return items modified since the given since unix timestamp */
  since?: number;
  /** Only return count number of items */
  count?: number;
  /** 	Used only with count; start returning from offset position of results */
  offset?: number;
};

export type GetItemsResult = {
  status: Status;
  list: {
    [key: string]: Item;
  };
  complete: number;
  // TODO
  error: Record<string, unknown>;
  // TODO
  search_meta: Record<string, unknown>;
  // search_meta: { search_type: "normal" };
  /** unix timestamp */
  since: number;
};

export type Item = {
  item_id: string;
  resolved_id: string;
  /** url */
  given_url: string;
  given_title: string;
  // 2 flag
  favorite: Favorite;
  // 3 flag
  status: Status;

  /** unix timestamp */
  time_added: string;
  /** unix timestamp */
  time_read: string;
  /** unix timestamp */
  time_favorited: string;
  /** unix timestamp */
  time_updated: string;
  sort_id: number;
  resolved_title: string;
  /** url */
  resolved_url: string;
  excerpt: string;
  // 2 flag
  is_article: "0" | "1";
  // 2 flag?
  is_index: "0" | "1";
  // 3 flag
  has_video: "0" | "1" | "2";
  // 3 flag
  has_image: "0" | "1" | "2";
  // number
  word_count: string;
  /** language code */
  lang: string;

  // time minus?
  time_to_read?: number;

  // url
  top_image_url?: string;
  // url
  amp_url?: string;
  domain_metadata?: DomainMetadata;

  // unix timestamp
  listen_duration_estimate: number;

  image?: ImageItem;
  images?: {
    [key: string]: ImageItem;
  };
  videos?: {
    [key: string]: VideoItem;
  };
  authors?: {
    [key: string]: AuthorItem;
  };
  tags?: {
    [key: string]: TagItem;
  };
};

export type ImageItem = {
  item_id: string;
  image_id?: string;
  src: string;
  width: number;
  height: number;
  credit?: string;
  caption?: string;
};

export type VideoItem = {
  item_id: string;
  video_id: string;
  // url
  src: string;
  // number
  width: string;
  // number
  height: string;
  // number
  type: string;
  vid: string;
  // number
  length: string;
};

export type AuthorItem = {
  item_id: string;
  author_id: string;
  name: string;
  // url
  url: string;
};

export type TagItem = {
  item_id: string;
  tag: string;
};

export type DomainMetadata = {
  name: string;
  // url
  logo: string;
  // url
  greyscale_logo: string;
};
