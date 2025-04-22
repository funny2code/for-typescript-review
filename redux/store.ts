import { configureStore } from "@reduxjs/toolkit";
import folderReducer from "./reducers/folderReducer";
import aieditorReducer from "./reducers/aieditorReducer";
import companyReducer from "./reducers/companyReducer";
const store = configureStore({
  reducer: {
    folder: folderReducer,
    aieditor: aieditorReducer,
    company: companyReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}).concat()
});

export type FileDispatch = typeof store.dispatch;

export default store;
