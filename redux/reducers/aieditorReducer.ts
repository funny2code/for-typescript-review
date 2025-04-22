import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { IAIEditorState } from "interfaces";

const initialState: IAIEditorState = {
  aiEditorData: {
    content: "",
    completionApi: "/api/generate",
    gptModel: "gpt-4", // "gpt-3.5-turbo",
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
  },
};

type AIEditorPayload<K extends keyof IAIEditorState["aiEditorData"]> = {
  key: K;
  value: IAIEditorState["aiEditorData"][K];
};

export const aieditorReducer = createSlice({
  name: "aieditor",
  initialState,

  reducers: {
    setAIEditor: <K extends keyof IAIEditorState["aiEditorData"]>(
      state: IAIEditorState,
      action: PayloadAction<AIEditorPayload<K>>
    ) => {
      const { key, value } = action.payload;
      state.aiEditorData[key] = value;
    }
  },
});

export const {
  setAIEditor
} = aieditorReducer.actions;

export const selectAIEditorState = (state: any) => state.aieditor;

export default aieditorReducer.reducer;
