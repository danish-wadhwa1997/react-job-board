import { useEffect, useState } from "react";
import Pagination from "./components/Pagination";
import useFetchApi from "./hooks/useFetchApi";
import usePagination from "./hooks/usePagination";
import Card from "./components/Card";
import ErrorBoundary from "./components/ErrorBoundary";

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
