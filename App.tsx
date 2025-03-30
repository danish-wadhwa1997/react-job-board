import React, { Component, useCallback, useMemo } from "react";
import { memo, useEffect, useState } from "react";

interface CardProps {
  title: string;
  company: string;
  location: string;
  description: string;
  id: string;
  isFavourite: boolean;
  toggleFavourite: (id: string) => void;
}
const Card = memo(
  ({
    title,
    company,
    location,
    description,
    id,
    isFavourite,
    toggleFavourite,
  }: CardProps) => {
    const handleFavouriteChange = () => {
      toggleFavourite(id);
    };

    return (
      <div>
        <p>{title}</p>
        <p>{company}</p>
        <p>{location}</p>
        <p>{description}</p>
        <button onClick={handleFavouriteChange}>
          {isFavourite ? "unfavourite" : "favourite"}
        </button>
      </div>
    );
  }
);

export class ErrorBoundary extends Component<any> {
  state = {
    hasError: false,
  };

  static getDerivedStatFromError(error: Error, errorInfo: React.ErrorInfo) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error boundary", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h3>Sorry there was a problem loading this page</h3>
        </div>
      );
    } else {
      return this.props.children;
    }
  }
}


interface Pagination{
  page:number;
  totalPages:number;
  increment:()=>void;
  decrement:()=>void;
}

const Pagination = ({page, totalPages, increment, decrement}:Pagination) => {
return (
  <div>
      <button onClick={decrement}>Previous</button>
      <span>{page} of {totalPages}</span> 
      <button onClick={increment}>Next</button>
  </div>
)
}


const useFetchApi = (url: string) => {
  const [error, setError] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>();

  const fetchData = useCallback(
    async (isMounted: boolean, AC:AbortController) => {
      try {
        const response = await fetch(url,{signal:AC.signal});
        if (response) {
          const result = await response.json();
          if (result && isMounted) {
            setData(result);
          }
        }
      } catch (error) {
        console.error("handled", error);
        setError("Api call failed");
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  useEffect(() => {
    let isMounted = true;
    const AC= new AbortController();
    setLoading(true);

    try {
      fetchData(isMounted, AC);
    } catch (error) {
      console.error(error)
    }

    return () => {
      isMounted = false;
      // AC.abort();
    };
  }, [fetchData]);

  return useMemo(() => ({ data, loading, error }), [data, error, loading]);
};


const getStartEndIndex = (
  totalItems: number,
  page: number,
  rowsPerPage: number
) => {
  const endIndex = Math.min(totalItems, page * rowsPerPage)-1;

  const startIndex = Math.max((page - 1) * rowsPerPage, 0);

  return { startIndex, endIndex };
};

const usePagination = (data: any[], rowsPerPage: number) => {
  const totalPages = useMemo(()=>data.length>0 ?Math.ceil(data.length / rowsPerPage):1,[data.length, rowsPerPage]);
  const [page, setPage] = useState<number>(1);

  const increment = useCallback(() => {
    if (page < totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  }, []);

  const decrement = useCallback(() => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  }, []);

  return useMemo(
    () => ({
      page,
      increment,
      decrement,
      ...getStartEndIndex(data.length, page, rowsPerPage),
      totalPages
    }),
    [page, increment, decrement, rowsPerPage, data.length, totalPages]
  );
};
const rowsPerPage = 10;
function App() {
  const [search, setSearch] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [favourites, setFavourites] = useState<Map<string, boolean>>(new Map());

  const { data, error, loading } = useFetchApi("https://jsonfakery.com/jobs");
  const { startIndex, endIndex, increment, decrement, page, totalPages } =
    usePagination(filteredData, rowsPerPage);

  const handleLocations = (data: any[]) => {
    const newLocations = new Set(data.map((item) => item.location));
    setLocations(Array.from(newLocations));
  };

  useEffect(() => {
    if (data && JSON.stringify(data) !== JSON.stringify(filteredData)) {
      setFilteredData(data);
      handleLocations(data);
    }
  }, [data]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Some Error Occured {error}</div>;
  }

  const toggleFavourite = (id: string) => {
    const newFavourites = new Map(favourites);
    if (favourites.get(id)) {
      newFavourites.set(id, false);
    } else {
      newFavourites.set(id, true);
    }
    setFavourites(newFavourites);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    handleFilter(e.target.value);
  };

  const handleFilter = (value: string) => {
    if (value) {
      const newData = data.filter((item) => item.title.toLowerCase().includes(value));
      setFilteredData(newData);
      handleLocations(newData);
    } else {
      setFilteredData(data);
      handleLocations(data);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value);
    if (search) {  
      setFilteredData(
        data.filter(
          (item) =>
            item.title.toLowerCase().includes(search) && item.location === e.target.value
        )
      );
    } else {
      setFilteredData(data.filter((item) => item.location === e.target.value));
    }
  };
  console.log("called");
  return (
    <ErrorBoundary>
      <div>
        <div>
          <input value={search} onChange={handleSearch} />
        </div>
        <div>
          <select onChange={handleLocationChange} value={selectedLocation}>
            <option value={""}>Any</option>
            {locations.length > 0 &&
              locations.map((location) => (
                <option value={location} key={location}>
                  {location}
                </option>
              ))}
          </select>
        </div>
        <div>
          {filteredData.length > 0 &&
            filteredData.slice(startIndex, endIndex).map((item) => {
              const id = item.title + Math.floor(Math.random() * 10);
              return (
                <Card
                  id={id}
                  key={id}
                  title={item.title}
                  description={item.description}
                  location={item.location}
                  company={item.company}
                  isFavourite={favourites.get(id) || false}
                  toggleFavourite={toggleFavourite}
                />
              );
            })}
        </div>

        <Pagination
          increment={increment}
          decrement={decrement}
          page={page}
          totalPages={totalPages}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
