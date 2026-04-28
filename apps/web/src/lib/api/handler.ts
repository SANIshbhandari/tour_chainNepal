import { NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { AppError } from "@/lib/errors";

type HandlerFunction<T> = (data: T, request: Request) => Promise<Response>;

export function apiHandler<T>(schema: ZodSchema<T>, handler: HandlerFunction<T>) {
  return async (request: Request): Promise<Response> => {
    try {
      const body = await request.json();
      const parsed = schema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: parsed.error.flatten(),
          },
          { status: 400 }
        );
      }

      return await handler(parsed.data, request);
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
          },
          { status: error.status }
        );
      }

      // Log server errors but don't expose details
      console.error("API handler error:", error);
      return NextResponse.json(
        {
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  };
}
