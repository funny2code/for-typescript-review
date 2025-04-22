"use client";

import { ThemeProvider, useTheme } from "next-themes";
import {
  createContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { Toaster } from "sonner";

import { Schema } from "amplify/data/resource";

export interface Report {
  url: string;
  id: string;
  title: string;
  introduction: string;
  matchedWords: number;
  identicalWords: number;
  similarWords: number;
  paraphrasedWords: number;
  totalWords: number;
  metadata: Record<string, unknown>;
  tags: string[];
}

export interface PutRequestType {
  action: "ADD" | "UPDATE";
  type: "PROMPT" | "PROMPTSET";
  data: object;
  _id: string | null;
  prompt_id: number | null;
}

export interface PostRequestType {
  action: "ADD" | "UPDATE";
  type: "PROMPT" | "PROMPTSET";
  data: object;
  _id: string | null;
}

export interface DeleteRequestType {
  type: "PROMPT" | "PROMPTSET";
  _id: string | null;
  prompt_id: number | null;
}

// Prompt Management Section
export type PromptType = Schema["Prompt"]["type"];
export type PromptSetType = Schema["Promptset"]["type"];

interface AppContextType {
  completionApi: string;
  gptModel: string;
  gptTemp: number;
  gptUserPrt: string;
  gptSysPrt: string;
  gptHighlight: string;
  gptArbVars: { [key: string]: string };
  gptTopP: number;
  gptMaxTokens: number;
  textToInsert: string;
  textFull: string;
  promptSets: PromptSetType[];
  selectedPromptSetId: string | null;
  selectedPromptId: string | null;
  llmOpt: string;
  scanId: string;
  reports: Report[];
  isScanning: boolean;
  novelEditor: any;
  reportDetail: any;
  setReportDetail: Dispatch<SetStateAction<any>>;
  setNovelEditor: Dispatch<SetStateAction<any>>;
  setGptModel: React.Dispatch<React.SetStateAction<string>>;
  setGptTemp: React.Dispatch<React.SetStateAction<number>>;
  setGptUserPrt: React.Dispatch<React.SetStateAction<string>>;
  setGptSysPrt: React.Dispatch<React.SetStateAction<string>>;
  setGptHighlight: React.Dispatch<React.SetStateAction<string>>;
  setGptArbVars: React.Dispatch<React.SetStateAction<any>>;
  setGptMaxTokens: React.Dispatch<React.SetStateAction<number>>;
  setGptTopP: React.Dispatch<React.SetStateAction<number>>;
  setTextToInsert: React.Dispatch<React.SetStateAction<string>>;
  setTextFull: React.Dispatch<React.SetStateAction<string>>;
  setPromptSets: React.Dispatch<React.SetStateAction<PromptSetType[]>>;
  setSelectedPromptSetId: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedPromptId: React.Dispatch<React.SetStateAction<string | null>>;
  setLlmOpt: React.Dispatch<React.SetStateAction<string>>;
  setScanId: React.Dispatch<React.SetStateAction<string>>;
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  setIsScanning: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextType>({
  completionApi: "/api/generate",
  gptModel: "gpt-3.5-turbo",
  gptTemp: 0.7,
  gptUserPrt: "{{text_full}}",
  gptSysPrt: "",
  gptHighlight: "",
  gptArbVars: {},
  gptTopP: 1,
  gptMaxTokens: 500,
  textToInsert: "",
  textFull: "",
  promptSets: [],
  selectedPromptSetId: null,
  selectedPromptId: null,
  llmOpt: "ChatGPT",
  scanId: "",
  reports: [],
  isScanning: false,
  novelEditor: null,
  reportDetail: null,
  setReportDetail: () => {},
  setNovelEditor: () => {},
  setGptModel: () => {},
  setGptTemp: () => {},
  setGptUserPrt: () => {},
  setGptSysPrt: () => {},
  setGptHighlight: () => {},
  setGptArbVars: () => {},
  setGptTopP: () => {},
  setGptMaxTokens: () => {},
  setTextToInsert: () => {},
  setTextFull: () => {},
  setPromptSets: () => {},
  setSelectedPromptSetId: () => {},
  setSelectedPromptId: () => {},
  setLlmOpt: () => {},
  setScanId: () => {},
  setReports: () => {},
  setIsScanning: () => {},
});

const ToasterProvider = () => {
  const { theme } = useTheme() as {
    theme: "light" | "dark" | "system";
  };
  return <Toaster theme={theme} />;
};

export function NovelProviders({ children }: { children: ReactNode }) {
  const completionApi = "/api/generate";
  const [gptModel, setGptModel] = useState("gpt-3.5-turbo");
  const [gptTemp, setGptTemp] = useState(1);
  const [gptUserPrt, setGptUserPrt] = useState("");
  const [gptSysPrt, setGptSysPrt] = useState("");
  const [gptHighlight, setGptHighlight] = useState("");
  const [gptArbVars, setGptArbVars] = useState<{ [key: string]: string }>({});
  const [gptTopP, setGptTopP] = useState(1);
  const [gptMaxTokens, setGptMaxTokens] = useState(500);
  const [textToInsert, setTextToInsert] = useState("");
  const [textFull, setTextFull] = useState("");
  const [promptSets, setPromptSets] = useState<PromptSetType[]>([]);
  const [selectedPromptSetId, setSelectedPromptSetId] = useState<string | null>(
    null
  );
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [llmOpt, setLlmOpt] = useState("ChatGPT");
  const [scanId, setScanId] = useState("");
  const [novelEditor, setNovelEditor] = useState(null);
  const [reportDetail, setReportDetail] = useState(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  return (
    <ThemeProvider
      attribute="class"
      enableSystem
      disableTransitionOnChange
      defaultTheme="light"
    >
      <AppContext.Provider
        value={{
          completionApi,
          gptModel,
          gptTemp,
          gptUserPrt,
          gptSysPrt,
          gptHighlight,
          gptArbVars,
          gptTopP,
          gptMaxTokens,
          textToInsert,
          textFull,
          promptSets,
          selectedPromptSetId,
          selectedPromptId,
          llmOpt,
          scanId,
          reports,
          isScanning,
          novelEditor,
          reportDetail,
          setReportDetail,
          setNovelEditor,
          setGptModel,
          setGptTemp,
          setGptUserPrt,
          setGptSysPrt,
          setGptHighlight,
          setGptArbVars,
          setGptTopP,
          setGptMaxTokens,
          setTextToInsert,
          setTextFull,
          setPromptSets,
          setSelectedPromptSetId,
          setSelectedPromptId,
          setLlmOpt,
          setScanId,
          setReports,
          setIsScanning,
        }}
      >
        <ToasterProvider />
        {children}
      </AppContext.Provider>
    </ThemeProvider>
  );
}
