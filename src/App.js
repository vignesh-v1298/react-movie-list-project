import { useEffect, useState } from "react";

const average = arr =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const apiKey = "your-api-key";

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [myList, setMyList] = useState([]);
  const [favouriteList, setFavouriteList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedID, setSelectedID] = useState(null);
  const [selectedMovieTitle, setSelectedMovieTitle] = useState(null);

  function handleSelectedProps(id, movieTitle) {
    setSelectedID(selectedid => (id === selectedid ? null : id));
    setSelectedMovieTitle(selectedtitle =>
      movieTitle === selectedtitle ? null : movieTitle
    );
  }

  function handleCloseSelectedProps() {
    setSelectedID(null);
    setSelectedMovieTitle(null);
  }

  function handleAddMyList(movie) {
    setMyList(watchlist => [...watchlist, movie]);
  }

  function handleFavouriteList(movie) {
    setFavouriteList(favlist => [...favlist, movie]);
  }

  function handleDeleteMovie(id) {
    setMyList(watched => watched.filter(movie => movie.imdbID !== id));
  }

  function handleDeleteFavMovie(id) {
    setFavouriteList(watched => watched.filter(movie => movie.imdbID !== id));
  }

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const response = await fetch(
            `http://www.omdbapi.com/?apikey=${apiKey}&s=${query}`,
            { signal: controller.signal }
          );
          if (!response.ok)
            throw new Error("Something Went with Fetching Movies");
          const data = await response.json();
          if (data.Response === "False") throw new Error("⛔Movie Not Found");
          setMovies(data.Search);
          // console.log(data.Search);
          setError("");
          // console.log(data);
          // console.log(data.Search);
        } catch (err) {
          // console.error(err);
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("🔍 Search Movies >3 Characters");
        return;
      }
      handleCloseSelectedProps();
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Search query={query} SetQuery={setQuery} />
        <TotalResults movies={movies} />
      </NavBar>
      <Main>
        {/* {isLoading ? <Loader /> : <Box1 movies={movies} />} */}
        {isLoading && <Loader />}
        {!isLoading && !error && (
          <Box1 movies={movies} onSelect={handleSelectedProps} />
        )}
        {error && <ErrorMessage message={error} />}

        <Box2>
          {selectedID && selectedMovieTitle ? (
            <MovieSummary
              selectedID={selectedID}
              selectedMovieTitle={selectedMovieTitle}
              onCloseMovie={handleCloseSelectedProps}
              onAddMyList={handleAddMyList}
              onAddFavlist={handleFavouriteList}
              watched={myList}
              favlist={favouriteList}
            />
          ) : (
            <>
              <CategoryLists>
                <CategoryWatchedList
                  mylist={myList}
                  onDeleteMovie={handleDeleteMovie}
                />
                <CategoryFavouriteList
                  favlist={favouriteList}
                  onDeleteMovie={handleDeleteFavMovie}
                />
              </CategoryLists>
            </>
          )}
        </Box2>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading....</p>;
}

function ErrorMessage({ message }) {
  return (
    <div className="box1">
      <p className="error">{message}</p>
    </div>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">📽️</span>
      <h1>Movie Bucket List</h1>
    </div>
  );
}

function Search({ query, SetQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={e => SetQuery(e.target.value)}
    />
  );
}

function TotalResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box1({ movies, onSelect }) {
  const [isOpenBox1, setIsOpenBox1] = useState(true);
  return (
    <div className="box1">
      <button className="btn-toggle" onClick={() => setIsOpenBox1(!isOpenBox1)}>
        {isOpenBox1 ? "-" : "+"}
      </button>
      {isOpenBox1 && (
        <div className="list">
          {movies?.map(movie => (
            <ul
              className="list-movies"
              key={movie.imdbID}
              onClick={() => onSelect(movie.imdbID, movie.Title)}
            >
              <li>
                <img src={movie.Poster} alt={`${movie.Title} Poster`} />
                <h3>{movie.Title}</h3>
                <div>
                  <p>
                    <span>🗓️</span>
                    <span>{movie.Year}</span>
                  </p>
                </div>
              </li>
            </ul>
          ))}
        </div>
      )}
    </div>
  );
}

function MovieSummary({
  selectedID,
  selectedMovieTitle,
  onCloseMovie,
  onAddMyList,
  onAddFavlist,
  watched,
  favlist,
}) {
  const [smovie, setSmovie] = useState({});
  const [sloading, setSloading] = useState(false);

  const isWatched = watched.map(movie => movie.imdbID).includes(selectedID);
  const isFav = favlist.map(movie => movie.imdbID).includes(selectedID);

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: realesed,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = smovie;

  function handleAdd() {
    const newMyList = {
      imdbID: selectedID,
      title: selectedMovieTitle,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
    };

    onAddMyList(newMyList);
    onCloseMovie();
  }

  function handleAddFav() {
    const newMyList = {
      imdbID: selectedID,
      title: selectedMovieTitle,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
    };

    onAddFavlist(newMyList);
    onCloseMovie();
  }

  useEffect(
    function () {
      function callBack(e) {
        if (e.code === "Escape") {
          onCloseMovie();
        }
      }
      document.addEventListener("keydown", callBack);

      return function () {
        document.removeEventListener("keydown", callBack);
      };
    },
    [onCloseMovie]
  );

  useEffect(
    function () {
      async function getMovieSummary() {
        setSloading(true);
        const response = await fetch(
          `http://www.omdbapi.com/?apikey=${apikey}&i=${selectedID}&t=${selectedMovieTitle}`
        );
        const data = await response.json();
        setSmovie(data);
        setSloading(false);
      }
      getMovieSummary();
    },
    [selectedID, selectedMovieTitle]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "Movie Bucket List";
      };
    },
    [title]
  );

  return (
    <>
      {sloading ? (
        <Loader />
      ) : (
        <>
          <div className="details">
            <header>
              <button className="btn-back" onClick={onCloseMovie}>
                &larr;
              </button>

              <img src={poster} alt="Poster" />
              <div className="details-overview">
                <h2>{title}</h2>
                <p>
                  {realesed} &bull; {runtime}
                </p>
                <p>{genre}</p>
                <p>
                  <span>⭐</span>
                  {imdbRating} IMDb Rating
                </p>
              </div>
            </header>
            <section>
              <p>
                <em>{plot}</em>
              </p>
              <p>Starring {actors}</p>
              <p>Directed by {director}</p>
              <div>
                {isWatched && isFav && (
                  <>
                    <button className="btn-add">Added to Watch list</button>
                    <button className="btn-add">Added to Favourite list</button>
                  </>
                )}
                {!isFav && isWatched && (
                  <>
                    <button className="btn-add">Added to Watch list</button>
                    <button className="btn-add" onClick={handleAddFav}>
                      {" "}
                      + Add to Favourite list
                    </button>
                  </>
                )}
                {!isWatched && !isFav && (
                  <>
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to Watch list
                    </button>

                    <button className="btn-add" onClick={handleAddFav}>
                      + Add to Favourite list
                    </button>
                  </>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </>
  );
}

function Box2({ children }) {
  return <div className="box2">{children}</div>;
}

function CategoryLists({ children }) {
  return <>{children}</>;
}

function CategoryWatchedList({ mylist, onDeleteMovie }) {
  const [isOpenBox2, setIsOpenBox2] = useState(false);
  const avgImdbRating = average(mylist.map(movie => movie.imdbRating));
  const avgRuntime = average(mylist.map(movie => movie.runtime));

  return (
    <div className="watchlists">
      <button className="btn-toggle" onClick={() => setIsOpenBox2(!isOpenBox2)}>
        {isOpenBox2 ? "-" : "+"}
      </button>
      {isOpenBox2 ? (
        <>
          <h2>My Watch List</h2>
          <div>
            <p>
              <span>#️⃣</span>
              <span>{mylist.length} Movies</span>
            </p>
            <p>
              <span>⭐</span>
              <span>{avgImdbRating.toFixed(2)}</span>
            </p>

            <p>
              <span>⏳</span>
              <span>{avgRuntime.toFixed(1)} min</span>
            </p>
          </div>
          <CategoryWatchListItems
            myList={mylist}
            onDeleteMovie={onDeleteMovie}
          />
        </>
      ) : (
        <>
          <h2>My Watch List</h2>
          <div>
            <p>
              <span>#️⃣</span>
              <span>{mylist.length} Movies</span>
            </p>
            <p>
              <span>⭐</span>
              <span>{avgImdbRating.toFixed(2)}</span>
            </p>

            <p>
              <span>⏳</span>
              <span>{avgRuntime.toFixed(1)} min</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function CategoryWatchListItems({ myList, onDeleteMovie }) {
  return (
    <>
      <ul className="listitems listitem-movies">
        {myList?.map(movie => (
          <DisplayItemsList
            movie={movie}
            key={movie.imdbID}
            onDeleteMovie={onDeleteMovie}
          />
        ))}
      </ul>
    </>
  );
}

function DisplayItemsList({ movie, onDeleteMovie }) {
  return (
    <>
      <li>
        <img src={movie.poster} alt="Poster" />
        <h2>{movie.title}</h2>
        <div>
          <p>
            <span>⭐️</span>
            <span>{movie.imdbRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{movie.runtime} min</span>
          </p>
        </div>
        <button
          className="btn-delete"
          onClick={() => onDeleteMovie(movie.imdbID)}
        >
          ❌
        </button>
      </li>
    </>
  );
}

function CategoryFavouriteList({ favlist, onDeleteMovie }) {
  const avgImdbRating = average(favlist.map(movie => movie.imdbRating));
  const avgRuntime = average(favlist.map(movie => movie.runtime));
  const [isOpenBox2, setIsOpenBox2] = useState(false);

  return (
    <div className="watchlists">
      <button className="btn-toggle" onClick={() => setIsOpenBox2(!isOpenBox2)}>
        {isOpenBox2 ? "-" : "+"}
      </button>
      {isOpenBox2 ? (
        <>
          <h2>My Favourite List</h2>
          <div>
            <p>
              <span>#️⃣</span>
              <span>{favlist.length} Movies</span>
            </p>
            <p>
              <span>⭐</span>
              <span>{avgImdbRating.toFixed(2)}</span>
            </p>

            <p>
              <span>⏳</span>
              <span>{avgRuntime.toFixed(1)} min</span>
            </p>
          </div>
          <CategoryFavouriteListItems
            favlist={favlist}
            onDeleteMovie={onDeleteMovie}
          />
        </>
      ) : (
        <>
          <h2>My Favourite List</h2>
          <div>
            <p>
              <span>#️⃣</span>
              <span>{favlist.length} Movies</span>
            </p>
            <p>
              <span>⭐</span>
              <span>{avgImdbRating.toFixed(2)}</span>
            </p>

            <p>
              <span>⏳</span>
              <span>{avgRuntime.toFixed(1)} min</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function CategoryFavouriteListItems({ favlist, onDeleteMovie }) {
  return (
    <>
      <ul className="listitems listitem-movies">
        {favlist?.map(movie => (
          <DisplayFavItemsList
            movie={movie}
            key={movie.imdbID}
            onDeleteMovie={onDeleteMovie}
          />
        ))}
      </ul>
    </>
  );
}

function DisplayFavItemsList({ movie, onDeleteMovie }) {
  return (
    <>
      <li>
        <img src={movie.poster} alt="Poster" />
        <h2>{movie.title}</h2>
        <div>
          <p>
            <span>⭐️</span>
            <span>{movie.imdbRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{movie.runtime} min</span>
          </p>
        </div>
        <button
          className="btn-delete"
          onClick={() => onDeleteMovie(movie.imdbID)}
        >
          ❌
        </button>
      </li>
    </>
  );
}
