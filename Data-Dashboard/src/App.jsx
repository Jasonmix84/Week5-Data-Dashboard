import { useState, useEffect } from 'react'
import './App.css'
import PetCard from './Components/PetCard'
const API_KEY = import.meta.env.VITE_APP_API_KEY
const SECRET_KEY = import.meta.env.VITE_APP_SECRET_KEY

function App() {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [shouldRefreshToken, setShouldRefreshToken] = useState(false);
  const [searchType, setSearchType] = useState('');
  const [searchState, setSearchState] = useState('');
  const [mostFrequentType, setMostFrequentType] = useState('');
  const [mostFrequentState, setMostFrequentState] = useState('');

  // Effect to acquire/refresh the access token
  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const tokenResponse = await fetch('https://api.petfinder.com/v2/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`,
        });
        const tokenData = await tokenResponse.json();
        setAccessToken(tokenData.access_token);
        setShouldRefreshToken(false);
      } catch (err) {
        setError(err);
        console.error("Error fetching access token:", err);
      }
    };

    if (!accessToken || shouldRefreshToken) {
      getAccessToken();
    }
  }, [accessToken, shouldRefreshToken]);

  // Effect to fetch pet data
  useEffect(() => {
    const fetchPets = async () => {
      if (!accessToken) {
        setLoading(true);
        return;
      }

      try {
        const response = await fetch('https://api.petfinder.com/v2/animals?limit=15', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 401) {
          setShouldRefreshToken(true);
          return;
        }

        const data = await response.json();
        setPets(data.animals);
        setFilteredPets(data.animals); // Initialize filteredPets with all pets

        // Fix: declare typeMap before using it
        const typeMap = {};
        data.animals.forEach(animal => {
          typeMap[animal.type] = (typeMap[animal.type] || 0) + 1;
        });
        const mostFreq = Object.keys(typeMap).reduce((acc, current) => {
          return typeMap[current] > typeMap[acc] ? current : acc;
        }, Object.keys(typeMap)[0]);
        setMostFrequentType(mostFreq);

        // Find the most frequent state
        const stateMap = {};
        data.animals.forEach(animal => {
          const state = animal.contact?.address?.state;
          if (state) {
            stateMap[state] = (stateMap[state] || 0) + 1;
          }
        });
        const mostFrequentState = Object.keys(stateMap).reduce((acc, current) => {
          return stateMap[current] > stateMap[acc] ? current : acc;
        }, Object.keys(stateMap)[0]);
        setMostFrequentState(mostFrequentState);

      } catch (err) {
        setError(err);
        console.error("Error fetching pets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [accessToken, shouldRefreshToken]);

  

  // Effect to filter pets by type and state
  useEffect(() => {
    let results = pets;

    if (searchType) {
      results = results.filter(pet =>
        pet.type && pet.type.toLowerCase().includes(searchType.toLowerCase())
      );
    }

    if (searchState) {
      results = results.filter(pet =>
        pet.contact && pet.contact.address && pet.contact.address.state &&
        pet.contact.address.state.toLowerCase() === searchState.toLowerCase()
      );
    }

    setFilteredPets(results);
  }, [searchType, searchState, pets]);

  if (loading) return <p>Loading pets...</p>;
  if (error) return <div><p>Error loading pets: {error.message}</p> <button onClick={() => setShouldRefreshToken(true)}>Retry</button></div>;

return (
    <div className="app-layout">
      <nav className="sidebar">
        <button className="nav-btn">Dashboard</button>
        <button className="nav-btn">Search</button>
        <button className="nav-btn">About</button>
      </nav>
      <div className="main-content">
        <header className="header">
          <h1>Pet Dashboard</h1>
        </header>
        <div className='summary-container'>
          <div className='summary-item'>
            <h2>Filtered Pets</h2>
            <p>{filteredPets.length}</p>
          </div>
          <div className='summary-item'>
            <h2>Most Frequent Adoption Pet Type</h2>
            <p>{mostFrequentType}</p>
          </div>
          <div className='summary-item'>
            <h2>Most Frequent State</h2>
            <p>{mostFrequentState}</p>
          </div>
        </div>
        <div className="main-page">
          <div className="search-bar" style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search by type (e.g. Dog, Cat)"
              value={searchType}
              onChange={e => setSearchType(e.target.value)}
              style={{ marginRight: '1rem' }}
            />
            <input
              type="text"
              placeholder="Filter by state (e.g. CA, NY)"
              value={searchState}
              onChange={e => setSearchState(e.target.value)}
            />
          </div>
          <div className="pet-list">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Age</th>
                  <th>Type</th>
                  <th>Breed</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>
                {filteredPets && filteredPets.map(pet => (
                  <PetCard key={pet.id} pet={pet}/>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App