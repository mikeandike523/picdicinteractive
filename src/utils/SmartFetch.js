import { parse as parseJSONC } from "jsonc-parser";

const ContentTypeShorthand = {
  json: "application/json",
  jsonc: "application/x-jsonc",
  text: "text/plain",
  html: "text/html",
  xml: "application/xml",
  form: "application/x-www-form-urlencoded",
  multipart: "multipart/form-data",
  "octet-stream": "application/octet-stream",
  "url-encoded": "application/x-www-form-urlencoded",
  binary: "application/octet-stream",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  mp4: "video/mp4",
  pdf: "application/pdf",
  wav: "audio/wav",
  svg: "image/svg+xml",
  mp3: "audio/mpeg",
  csv: "text/csv",
  jpg: "image/jpeg",
  // ... can add more as needed
};

/**
 *
 * @param {string} contentTypeShorthandOrFull
 * @param {string}
 */
function normalizeContentType(contentTypeShorthandOrFull) {
  const values = Object.values(ContentTypeShorthand);
  if (values.includes(contentTypeShorthandOrFull)) {
    return contentTypeShorthandOrFull;
  }
  if (typeof contentTypeShorthandOrFull === "string") {
    return ContentTypeShorthand[contentTypeShorthandOrFull];
  }
  throw new Error(
    `Invalid content type (shorthand or full): ${contentTypeShorthandOrFull}`
  );
}

export const SmartFetchErrorReason = [
  "HTTPError",
  "JSONParseError",
  "HTTPErrorAndJSONParseError",
  "UnspecifiedClientError",
];

export class SmartFetchError extends Error {
  static buildMessage({
    reason,
    statusCode,
    responseText,
    responseJSON,
    originalError,
  }) {
    return `
SmartFetchError:

${
  {
    HTTPError: `Received bad response from server: ${statusCode}`,
    JSONParseError: `Request succeeded (status code ${statusCode}) but returned invalid JSON`,
    HTTPErrorAndJSONParseError: `Received bad response from server: ${statusCode}. Response text was also not valid JSON`,
    UnspecifiedClientError: `An unknown error occured while attempting to make the request`,
  }[reason]
}

Response Text:

${responseText}

${
  typeof responseJSON !== "undefined"
    ? `Response JSON:\n\n${JSON.stringify(responseJSON, null, 2)}`
    : ""
}

${
  typeof originalError === "object" && originalError
    ? `Original ${
        reason === "JSONParseError" ? "Parsing" : "Unspecified"
      } Error Message:\n\n${originalError.message}`
    : ""
}

${
  typeof originalError === "object" && originalError
    ? `Original ${
        reason === "JSONParseError" ? "Parsing" : "Unspecified"
      } Error Stack:\n\n${originalError.stack}`
    : ""
}

        `.trim();
  }
  constructor({
    reason,
    statusCode,
    responseText,
    responseJSON,
    originalError,
  }) {
    super(
      SmartFetchError.buildMessage({
        reason,
        statusCode,
        responseText,
        originalError,
      })
    );
    this.name = "SmartFetchError";
    Object.assign(this, {
      reason,
      statusCode,
      responseText,
      originalError,
      responseJSON,
    });
  }
}

export default class SmartFetch {
  constructor(url) {
    this.__url = url;
    this.__headers = {};

    this.method("GET");
    this.requestType("json");
    this.responseType("json");
  }

  headers(headers) {
    this.__headers = headers;
    return this;
  }

  header(key, value) {
    this.__headers[key] = value;
    return this;
  }

  method(method) {
    this.__method = method.toUpperCase();
    return this;
  }

  requestType(typeShorthandOrFull) {
    if (
      typeShorthandOrFull === "jsonc" ||
      typeShorthandOrFull === "application/x-jsonc"
    ) {
      this.requestIsJSONC = true;
      this.headers["Content-Type"] = "text/plain";
    }
    this.__headers["Content-Type"] = normalizeContentType(typeShorthandOrFull);
    return this;
  }

  responseType(typeShorthandOrFull) {
    if (
      typeShorthandOrFull === "jsonc" ||
      typeShorthandOrFull === "application/x-jsonc"
    ) {
      this.responseIsJSONC = true;
      this.__headers["Accept"] = "text/plain";
    }
    this.__headers["Accept"] = normalizeContentType(typeShorthandOrFull);
    return this;
  }

  requestTypeIsJSON() {
    return this.__headers["Content-Type"].startsWith("application/json");
  }

  requestTypeIsJSONC() {
    return this.requestIsJSONC;
  }

  responseTypeIsJSONC() {
    return this.responseIsJSONC;
  }

  responseTypeIsJSON() {
    return this.__headers["Accept"].startsWith("application/json");
  }

  encoding(encoding) {
    this.__encoding = encoding;
    return this;
  }

  __getHeadersWithEncoding() {
    const __headers = { ...this.__headers };
    if (typeof __headers["Content-Type"] === "string") {
      __headers["Content-Type"] += `; charset=${this.__encoding}`;
    }
    if (typeof __headers["Accept"] === "string") {
      __headers["Accept"] += `; charset=${this.__encoding}`;
    }
    return __headers;
  }

  token(token) {
    this.__headers["Authorization"] = `Bearer ${token}`;
    return this;
  }

  data(data) {
    this.__data = data;
    return this;
  }

  hasData() {
    return (
      (typeof this.__data === "string" || typeof this.__data === "object") &&
      this.__data !== null
    );
  }

  async fetch() {
    const requestInit = {};
    if (this.hasData()) {
      requestInit.body = this.requestTypeIsJSON()
        ? JSON.stringify(this.__data)
        : this.__data;
    }
    requestInit.headers = this.__getHeadersWithEncoding();
    requestInit.method = this.__method;
    try {
      const response = await fetch(this.__url, requestInit);
      const responseText = await response.text();
      if (!response.ok) {
        if (this.responseTypeIsJSON() || this.responseTypeIsJSONC()) {
          try {
            throw new SmartFetchError({
              reason: "HTTPError",
              statusCode: response.status,
              responseText,
              // Plain json is valid jsonc
              responseJSON: parseJSONC(responseText),
            });
          } catch (e) {
            throw new SmartFetchError({
              reason: "HTTPErrorAndJSONParseError",
              statusCode: response.status,
              responseText,
              originalError: e,
            });
          }
        } else {
          throw new SmartFetchError({
            reason: "HTTPError",
            statusCode: response.status,
            responseText,
          });
        }
      }
      if (this.responseTypeIsJSON() || this.responseTypeIsJSONC()) {
        try {
          // Plain json is valid jsonc
          return parseJSONC(responseText);
        } catch (e) {
          throw new SmartFetchError({
            reason: "JSONParseError",
            statusCode: response.status,
            responseText,
            originalError: e,
          });
        }
      } else {
        return responseText;
      }
    } catch (e) {
      throw new SmartFetchError({
        reason: "UnspecifiedClientError",
        originalError: e,
      });
    }
  }
}
