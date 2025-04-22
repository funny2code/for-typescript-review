import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic  } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { PromptTemplate } from '@langchain/core/prompts';
import { BytesOutputParser } from '@langchain/core/output_parsers';

import OpenAI from "openai";
import { StreamingTextResponse } from "ai";

// Create an OpenAI API client (that's edge friendly!)
// Using LLamma's OpenAI client:

// IMPORTANT! Set the runtime to edge: https://vercel.com/docs/functions/edge-functions/edge-runtime
export const runtime = "edge";

const llama = new OpenAI({
  apiKey: "ollama",
  baseURL: "http://localhost:11434/v1",
});

const replacePrompt = (prt:string, params:any) => {
  const delimiterRegex = /{{\s*(.*?)\s*}}/g;

  let placeholders = [];
  let _match: any;
    do {
        _match = delimiterRegex.exec(prt);
      if (!_match) break;
      placeholders.push(_match[1]);
    } while(_match);

    let replacedPrt = prt.replace(delimiterRegex, (m: string, placeholder: string) => {
      return params.gptArbVars[placeholder] || params[placeholder];
    });

    return replacedPrt;
}

export async function POST(req: Request): Promise<Response> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  // Check if the OPENAI_API_KEY is set, if not return 400
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "") {
    return new Response(
      "Missing OPENAI_API_KEY - make sure to add it to your .env file.",
      {
        status: 400,
      },
    );
  }

  let { prompt, option, command, params } = await req.json();

  let systemPrt = '',
      userPrt = '';
  
  const TEMPLATE = `
  Current Conversation:
  {systemContent}
  User: {userContent}
  `;

  if (option && option == 'continue') {
    systemPrt = replacePrompt(params.gptSysPrt, params);
    userPrt = replacePrompt(params.gptUserPrt, params);
  } else {
    switch (option) {
      case "improve":
        systemPrt = "You are an AI writing assistant that improves existing text. " +
        "Limit your response to no more than 200 characters, but make sure to construct complete sentences." +
        "Use Markdown formatting when appropriate.";
        userPrt = `The existing text is: ${prompt}`;
        break;
      case "shorter":
        systemPrt = "You are an AI writing assistant that shortens existing text. " +
        "Use Markdown formatting when appropriate.";
        userPrt = `The existing text is: ${prompt}`;
        break;
      case "longer":
        systemPrt = "You are an AI writing assistant that lengthens existing text. " +
        "Use Markdown formatting when appropriate.";
        userPrt = `The existing text is: ${prompt}`;
        break;
      case "fix":
        systemPrt = "You are an AI writing assistant that fixes grammar and spelling errors in existing text. " +
        "Limit your response to no more than 200 characters, but make sure to construct complete sentences." +
        "Use Markdown formatting when appropriate.";
        userPrt = `The existing text is: ${prompt}`;
        break;
      case "zap":
        systemPrt = "You area an AI writing assistant that generates text based on a prompt. " +
        "You take an input from the user and a command for manipulating the text" +
        "Use Markdown formatting when appropriate.";
        userPrt = `For this text: ${prompt}. You have to respect the command: ${command}`;
        break;
    
      default:
        break;
    }
  }

  const openAIModel = new ChatOpenAI({
    modelName: params.gptModel,
    maxTokens: params.gptMaxTokens,
    topP: params.gptTopP,
    temperature: params.gptTemp,
    frequencyPenalty: 0,
    presencePenalty: 0,
    streaming: true,
    n: 1,
  });

  const anthropicAIModel = new ChatAnthropic({
    modelName: params.gptModel,
    maxTokens: params.gptMaxTokens,
    topP: params.gptTopP,
    temperature: params.gptTemp,
    streaming: true,
  });

  const geminiModel = new ChatGoogleGenerativeAI({
    modelName: params.gptModel,
    maxOutputTokens: params.gptMaxTokens,
    topP: params.gptTopP,
    temperature: params.gptTemp,
    streaming: true,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
    ],
  });

  const outputParser = new BytesOutputParser();
  const _prompt = PromptTemplate.fromTemplate(TEMPLATE);

  const chain = _prompt.pipe(
    openAIModel
    // (params.llmOpt == "ChatGPT") ? openAIModel : (params.llmOpt == "Gemini" ? geminiModel : anthropicAIModel)
  ).pipe(outputParser);
  
  const stream = await chain.stream({
    systemContent: systemPrt,
    userContent: userPrt
  });

  return new StreamingTextResponse(stream);
}
