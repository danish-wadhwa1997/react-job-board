import axios from "axios";
import { useState, useEffect, useCallback, useMemo } from "react";

const useFetchApi = (url: string) => {
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async (controller: AbortController) => {
    setLoading(true);
    try {
      const response = await axios.get(url, {
        signal: controller.signal, // Integrate AbortController's signal with axios
      });
      setData(response.data);
    } catch (err: any) {
      if (axios.isCancel(err)) {
        console.log("Request canceled");
      } else {
        console.error("Axios error", err);
        setError(err.response?.data?.message || "API call failed");
      }
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    const controller = new AbortController();

    fetchData(controller);

    return () => {
      controller.abort(); // Cleanup on unmount or URL change
    };
  }, [fetchData]);

  return useMemo(() => ({ data, loading, error }), [data, loading, error]);
};