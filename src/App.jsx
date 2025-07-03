import { useCallback, useEffect, useRef, useState } from 'react';

import Places from './components/Places.jsx';
import { AVAILABLE_PLACES } from './data.js';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import { sortPlacesByDistance } from './loc.js';

function App() {
  const [modalIsOpen, setModalIsOpen] = useState();
  const selectedPlace = useRef();
  const [availablePlaces, setAvailablePlaces] = useState([]);

  // ✅ Inizializza pickedPlaces in modo sicuro per evitare crash in fase di build
  const [pickedPlaces, setPickedPlaces] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
      return storedIds
        .map((id) => AVAILABLE_PLACES.find((place) => place.id === id))
        .filter(Boolean); // Rimuove elementi undefined
    } catch (e) {
      console.error('Error reading selectedPlaces from localStorage:', e);
      return [];
    }
  });

  useEffect(()=>{
       setAvailablePlaces(AVAILABLE_PLACES);
  },[]);

  function handleGeoLocalizationRequest(){
      navigator.geolocation.getCurrentPosition(
      (position) => {
        const sortedPlaces = sortPlacesByDistance(
          AVAILABLE_PLACES,
          position.coords.latitude,
          position.coords.longitude
        );
        setAvailablePlaces(sortedPlaces);
      },
      (error) => {
        console.error('Error finding user position', error);
        setAvailablePlaces(AVAILABLE_PLACES);
      }
      );
  }
  

  function handleStartRemovePlace(id) {
    setModalIsOpen(true);
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  function handleSelectPlace(id) {
    setPickedPlaces((prevPickedPlaces) => {
      if (prevPickedPlaces.some((place) => place.id === id)) return prevPickedPlaces;

      const place = AVAILABLE_PLACES.find((place) => place.id === id);
      if (!place) return prevPickedPlaces;

      return [place, ...prevPickedPlaces];
    });

    try {
      const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
      if (!storedIds.includes(id)) {
        localStorage.setItem('selectedPlaces', JSON.stringify([id, ...storedIds]));
      }
    } catch (e) {
      console.error('Failed to read/write localStorage:', e);
      localStorage.setItem('selectedPlaces', JSON.stringify([id]));
    }
  }

  const handleRemovePlace = useCallback(function handleRemovePlace() {
    setPickedPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
    );
    setModalIsOpen(false);
    try {
      const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
      const updatedIds = storedIds.filter((id) => id !== selectedPlace.current);
      localStorage.setItem('selectedPlaces', JSON.stringify(updatedIds));
    } catch (e) {
      console.error('Failed to update localStorage after remove:', e);
    }
  }, []);

  return (
    <>
      <Modal open={modalIsOpen}>
        <DeleteConfirmation onCancel={handleStopRemovePlace} onConfirm={handleRemovePlace} />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or you have visited.
        </p>
        <button  className='btn' onClick={handleGeoLocalizationRequest}>
          Click here to sort places by your current location
        </button>
      </header>

      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText={'Select the places you would like to visit below.'}
          places={pickedPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        <Places
          title="Available Places"
          places={availablePlaces}
          fallbackText="Sorting places by distance..."
          onSelectPlace={handleSelectPlace}
        />
      </main>
    </>
  );
}

export default App;
