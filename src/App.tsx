import { ChangeEvent, useEffect, useState, useMemo } from "react";
import "./App.css";
import axios from "axios";
import { URL, API_KEY } from "./constants";
import { Button, Grid } from "@mui/material";
import {
  MovieSearch,
  Pagination,
  Preloader,
  SortByPopularity,
  SecondMovieCard,
  LanguageButton,
} from "./components";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { add, remove } from "./redux/slices/favoritesSlice";

// https://api.themoviedb.org/
// eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NjI4OGMwNDY1ZGI1NWM5OWM3NmNjNDgyMDlkMGIwZSIsInN1YiI6IjVmYzgwZTIwZGFmNTdjMDAzZmIxNGQyYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.yTjTeQDpEpxvS_OBS-Vte9QlLaCj2fbZeoLW1q6fV7s
// 66288c0465db55c99c76cc48209d0b0e
// https://api.themoviedb.org/3/movie/550?api_key=66288c0465db55c99c76cc48209d0b0e

// https://image.tmdb.org/t/p/w500/ngl2FKBlU4fhbdsrtdom9LVLBXw.jpg // url pro obrazek

function App() {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites);
  const [movies, setMovies] = useState([]);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("asc");
  const [language, setLanguage] = useState("ru-RU");

  const handleAddToFavorite = (id: number) => {
    const favoriteMoviesArray = favorites.filter(
      ({ id: movieId }) => movieId === id
    );
    const movieToAdd = movies.filter(
      ({ id: movieId }) => movieId === id
    )[0];

    if (favoriteMoviesArray.length === 0) {
      dispatch(add(movieToAdd));
    } else {
      dispatch(remove(id));
    }
  };

  console.log("favorites:", favorites);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(event?.target?.value);
  };

  const handlePrevClick = () => {
    setPage(page - 1);
  };

  const handleNextClick = () => {
    setPage(page + 1);
  };

  const handleChangeSort = () => {
    const sortByValue = sortBy === "asc" ? "desc" : "asc";
    setSortBy(sortByValue);
  };

  const handleChangeLanguage = (languageName: string) => {
    switch (languageName) {
      case "EN":
        setLanguage("en-EN");
        break;

      case "CZ":
        setLanguage("cz-CZ");
        break;

      case "RU":
        setLanguage("ru-RU");
        break;
    }
  };

  const filteredBySearch = useMemo(() => {
    return movies.filter((movie) => {
      const words = movie.title.toLowerCase().split(" ");

      return words.some((word: string) =>
        word.startsWith(searchInputValue.split(" ")[0].toLowerCase())
      );
    });
  }, [searchInputValue, movies]);

  const fetchData = async () => {
    const response = await axios.get(
      `${URL}/3/discover/movie?page=${page}&sort_by=popularity.${sortBy}&language=${language}`,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
      }
    );

    return response?.data;
  };

  useEffect(() => {
    (async () => {
      const data = await fetchData();

      setMovies(data?.results);
    })();
  }, [page, sortBy, language]);

  return (
    <Grid container spacing={2} justifyContent="flex-end">
      <Link to="/favorites">
        <Button>Favorites</Button>
      </Link>
      <LanguageButton
        language={language}
        languageName="EN"
        onLanguageChange={handleChangeLanguage}
      />
      <LanguageButton
        language={language}
        languageName="CZ"
        onLanguageChange={handleChangeLanguage}
      />
      <LanguageButton
        language={language}
        languageName="RU"
        onLanguageChange={handleChangeLanguage}
      />
      {filteredBySearch.length === 0 ? (
        <Preloader />
      ) : (
        <Grid
          item
          container
          spacing={2}
          justifyContent="center"
          alignItems="center"
        >
          <Grid item>
            <MovieSearch
              handleSearchChange={handleSearchChange}
              searchInputValue={searchInputValue}
            />
            <Pagination
              page={page}
              onPrevClick={handlePrevClick}
              onNextClick={handleNextClick}
            />
            <SortByPopularity toggleSort={handleChangeSort} sortBy={sortBy} />
          </Grid>
          <Grid item container spacing={2} direction="row">
            {filteredBySearch.map((movie) => (
              <Grid item xs={12} sm={6} lg={1.5} key={movie?.id}>
                <SecondMovieCard
                  id={movie?.id}
                  title={movie?.title}
                  releaseDate={movie?.release_date}
                  posterPath={movie?.poster_path}
                  handleAddToFavorite={handleAddToFavorite}
                  isFavorite={favorites.filter(({ id }) => movie?.id === id).length !== 0}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}

export default App;
