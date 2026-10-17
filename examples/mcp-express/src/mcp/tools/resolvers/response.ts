import { CallToolResult } from "@modelcontextprotocol/server";

export interface ResponseResolver<T> {
  success(value: T): CallToolResult;
  error(cause: unknown): CallToolResult;
}
