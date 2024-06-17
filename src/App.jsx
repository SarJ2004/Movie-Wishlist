import "./style.css";
import { Auth } from "./components/Auth";
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
// getDocs fn is use do fetch our document from the state
// we also have to specify the collection
// add docs is used to add a component into our movie
// doc gets a document reference of a specified document in a list
import { db, auth } from "./config/firebase";
import { useState, useEffect } from "react";
export default function App() {
  const [movieList, setMovieList] = useState([]);
  const moviesCollectionRef = collection(db, "movies");
  //we will have to provide the database as well as the collection key
  // for anything to load on the first render itself, we need useEffect
  //a function which we want to run on the initial render of app, i.e. we dont want to run any functions.

  // NEW MOVIE STATES:
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const [newReleaseDate, setNewReleaseDate] = useState(0);
  const [isNewMovieOscar, setIsNewMovieOscar] = useState(false);
  // UPDATE TITLE STATE
  const [updatedTitle, setUpdatedTitle] = useState("");
  // console.log(typeof movieList);
  const getMovieList = async () => {
    //READ DATA
    // SET MOVIELIST = DATA
    try {
      const data = await getDocs(moviesCollectionRef);
      // console.log(data);
      // returns many non-useful info
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      // to get only the data that we want, not other things
      // we also included an id
      // console.log(typeof data);

      // console.log(filteredData);
      setMovieList(filteredData);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    getMovieList();
  }, []);
  //empty dependency, so that it doesnt runs everytime there is a change of state
  const onSubmitMovie = async () => {
    // we dont have to add an id, since it will already be generated when we add a doc
    try {
      await addDoc(moviesCollectionRef, {
        title: newMovieTitle,
        releaseDate: newReleaseDate,
        receivedAnOscar: isNewMovieOscar,
        userId: auth?.currentUser?.uid,
        // if auth exists, then only we want to access the currentuser and the uid
      });
      getMovieList();
    } catch (err) {
      console.log(err);
    }
  };

  const onDelete = async (id) => {
    const movieDoc = doc(db, "movies", id);
    await deleteDoc(movieDoc);
    getMovieList();
  };

  const onTitleUpdate = async (id) => {
    const movieDoc = doc(db, "movies", id);
    updateDoc(movieDoc, { title: updatedTitle });
    getMovieList();
  };
  return (
    <div className="App">
      <Auth />
      <div>
        <input
          type="text"
          placeholder="Movie Name...."
          onChange={(e) => setNewMovieTitle(e.target.value)}
        />
        <input
          type="number"
          placeholder="Release Date...."
          onChange={(e) => setNewReleaseDate(Number(e.target.value))}
        />
        <input
          type="checkbox"
          checked={isNewMovieOscar}
          onChange={(e) => setIsNewMovieOscar(e.target.checked)}
        />
        <label htmlFor="">Received an Oscar</label>
        <button onClick={onSubmitMovie}>Submit Movie</button>
      </div>
      <ul>
        {movieList.map((movie) => (
          <li id={movie.id} style={{ listStyleType: "none" }}>
            <h1 style={{ color: movie.receivedAnOscar ? "green" : "red" }}>
              {movie.title}
            </h1>
            <p>Date: {movie.releaseDate}</p>
            <button onClick={() => onDelete(movie.id)}>Delete</button>
            <input
              type="text"
              placeholder="New Title..."
              onChange={(e) => setUpdatedTitle(e.target.value)}
            />
            <button onClick={() => onTitleUpdate(movie.id)}>
              Update Title
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
