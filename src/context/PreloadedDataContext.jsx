import { createContext, useContext } from "react";

const PreloadedDataContext = createContext({});

export function PreloadedDataProvider({ children, value = {} }) {
  return <PreloadedDataContext.Provider value={value}>{children}</PreloadedDataContext.Provider>;
}

export function usePreloadedData() {
  return useContext(PreloadedDataContext);
}
