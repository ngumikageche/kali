import { createContext, useContext, useMemo } from "react";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { storefrontApi } from "../lib/storefrontApi.js";
import { normalizeCategory, normalizeStore } from "../utils/storefront.js";

const StorefrontContext = createContext(null);

export function StorefrontProvider({ children }) {
  const { data, loading, error } = useAsyncData(
    async () => {
      const [companyResult, categoryResult, storeResult] = await Promise.allSettled([
        storefrontApi.company.get(),
        storefrontApi.categories.list(),
        storefrontApi.stores.list()
      ]);

      return {
        company: companyResult.status === "fulfilled" ? companyResult.value.company || companyResult.value : null,
        categories: categoryResult.status === "fulfilled" ? (categoryResult.value.categories || []).map(normalizeCategory) : [],
        stores: storeResult.status === "fulfilled" ? (storeResult.value.stores || storeResult.value || []).map(normalizeStore) : []
      };
    },
    [],
    { initialData: { company: null, categories: [], stores: [] }, cacheKey: "storefront" }
  );

  const value = useMemo(
    () => ({
      company: data?.company || null,
      categories: data?.categories || [],
      stores: data?.stores || [],
      loading,
      error
    }),
    [data, error, loading]
  );

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefront() {
  return useContext(StorefrontContext);
}
