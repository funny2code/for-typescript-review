import {
  setAIEditor
} from "../reducers/aieditorReducer";
import { Dispatch } from "redux";

export const setAIEditorAction = (aiEditor: any) => (dispatch: Dispatch) => {
  dispatch(setAIEditor(aiEditor));
};