import abbeyRoad from "./assets/abbeyroad.jpeg";
import theStrokes from "./assets/isthisit.png";
import fleetwoodMac from "./assets/fleetwoodmac.png";
import the1975 from "./assets/the1975.jpeg";
import sundays from "./assets/sundays.jpg";
import thesmiths from "./assets/theSmiths.jpg";

export type Album = {
    deezer_id: string;
    title: string;
    artist_name: string;
    cover_url: string;
    rating: number;
  };
  
  //example albums, change later when connected
  export const albums: Album[] = [
    {
      deezer_id:"1", 
      title: "Abbey Road",
      artist_name: "The Beatles",
      cover_url: abbeyRoad,
      rating: 4
    },
    {
      deezer_id:"2", 
      title: "The Strokes",
      artist_name: "The Strokes",
      cover_url: theStrokes,
      rating: 5
    },
    {
      deezer_id:"3", 
      title: "Fleetwood Mac",
      artist_name: "Fleetwood Mac",
      cover_url: fleetwoodMac,
      rating: 3
    },
    {
      deezer_id:"4", 
      title: "The Queen is Dead",
      artist_name: "The Smiths",
      cover_url: thesmiths,
      rating: 4
    },
    {
      deezer_id:"5", 
      title: "Being Funny in a Foreign Language",
      artist_name: "The 1975",
      cover_url: the1975,
      rating: 3
    },
    {
      deezer_id:"6", 
      title: "Static & Silence",
      artist_name: "The Sundays",
      cover_url: sundays,
      rating: 4
    }
  ];
