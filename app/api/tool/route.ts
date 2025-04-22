import { NextRequest, NextResponse } from "next/server";

import outputs from "../../../amplify_outputs.json";

export async function GET(req: NextRequest) {
  // console.log("------------");
  // console.log("Starting...");
  const { searchParams } = new URL(req.url);

  const toolId = searchParams.get("toolId") || "defaultToolId";
  const threadId = searchParams.get("threadId") || "defaultThreadId";
  const companyId = searchParams.get("companyId") || "defaultCompanyId";

  const lambdaUrl = `${
    outputs.custom.toolStreamLambdaInvokeUrl
  }/?toolId=${encodeURIComponent(toolId)}&threadId=${encodeURIComponent(
    threadId
  )}&companyId=${encodeURIComponent(companyId)}`;

  try {
    const response = await fetch(lambdaUrl, {});

    if (!response.body) {
      return new NextResponse("Failed to fetch the stream", { status: 500 });
    }

    const readableStream = new ReadableStream({
      async start(controller) {
        if (!response.body) {
          throw new Error("Response body is null");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(chunk);
          }
        }
        controller.close();
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    });
  } catch (error) {
    // console.error("Error fetching stream:", error);
    return new NextResponse(`Error fetching stream: ${error}`, {
      status: 500,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    });
  }
}
