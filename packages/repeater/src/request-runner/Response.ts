import { Protocol } from '../models';

export class Response {
  public readonly protocol: Protocol;
  public readonly statusCode?: number;
  public readonly headers?: Record<string, string | string[] | undefined>;
  public readonly body?: string;
  public readonly message?: string;
  public readonly errorCode?: string;

  constructor({
    protocol,
    statusCode,
    headers,
    body,
    message,
    errorCode
  }: {
    protocol: Protocol;
    statusCode?: number;
    message?: string;
    errorCode?: string;
    headers?: Record<string, string | string[] | undefined>;
    body?: string;
  }) {
    this.protocol = protocol;
    this.statusCode = statusCode;
    this.headers = headers;
    this.body = body;
    this.errorCode = errorCode;
    this.message = message;
  }
}
