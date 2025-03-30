import { useCallback, useEffect, useMemo, useState } from "react";

const useFetchApi = (url: string) => {
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async (controller: AbortController) => {
    setLoading(true);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err:any) {
      if (err.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        console.error("Fetch error", err);
        setError("Api call failed");
      }
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    const controller = new AbortController();

    fetchData(controller);

    return () => {
      controller.abort(); // Clean up the request on unmount
    };
  }, [fetchData]);

  return useMemo(() => ({ data, loading, error }), [data, loading, error]);
};
export default useFetchApi;
