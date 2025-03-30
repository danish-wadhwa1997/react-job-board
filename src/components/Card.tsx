import React from "react";

interface CardProps {
  title: string;
  company: string;
  location: string;
  description: string;
  id: string;
  isFavourite: boolean;
  toggleFavourite: (id: string) => void;
}
const Card = React.memo(
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

export default Card;
