
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

export default Pagination