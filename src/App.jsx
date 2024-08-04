import React, { useState, useEffect } from 'react';
import './App.css';
import Table from './components/Table';
import Filters from './components/Filters';
import CarDetails from './components/CarDetails';

const citiesCoordinates = {
  Santiago: { lat: -33.45694, lon: -70.64827 },
  PuenteAlto: { lat: -33.61169, lon: -70.57577 },
  Antofagasta: { lat: -23.65236, lon: -70.3954 },
  VinaDelMar: { lat: -33.02457, lon: -71.55183 },
  Valparaiso: { lat: -33.036, lon: -71.62963 },
  Talcahuano: { lat: -36.72494, lon: -73.11684 },
  SanBernardo: { lat: -33.59217, lon: -70.6996 },
  PuertoMontt: { lat: -41.4693, lon: -72.94237 },
  Temuco: { lat: -38.73965, lon: -72.59842 },
  Concepcion: { lat: -36.82699, lon: -73.04977 },
  Arica: { lat: -18.4746, lon: -70.29792 },
  Rancagua: { lat: -34.17083, lon: -70.74444 },
  LaPintana: { lat: -33.58331, lon: -70.63419 },
  Talca: { lat: -35.4264, lon: -71.65542 },
  Iquique: { lat: -20.21326, lon: -70.15027 },
  Calama: { lat: -22.45667, lon: -68.92371 },
  Coquimbo: { lat: -29.95332, lon: -71.33947 },
  LaSerena: { lat: -29.90453, lon: -71.24894 },
  Chillan: { lat: -36.60664, lon: -72.10344 },
  VillaAlemana: { lat: -33.04823, lon: -71.3729 }
};

const getRandomCoordinates = () => {
  const cities = Object.keys(citiesCoordinates);
  const randomCity = cities[Math.floor(Math.random() * cities.length)];
  const { lat, lon } = citiesCoordinates[randomCity];
  const randomOffset = () => (Math.random() - 0.5) * 0.1;
  return {
    lat: (lat + randomOffset()).toFixed(6),
    lon: (lon + randomOffset()).toFixed(6),
    city: randomCity
  };
};

const App = () => {
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    year: '',
    transmissionType: '',
    combinedConsumptionMin: '',
    combinedConsumptionMax: ''
  });

  const [allCars, setCars] = useState([]);
  const [displayCars, setDisplayCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [carsPerPage] = useState(20);
  const [selectedCar, setSelectedCar] = useState(null);
  const [currentView, setCurrentView] = useState('table');

  const fetchCars = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      let queryString = Object.keys(filters)
        .filter(key => filters[key] && filters[key] !== '' && key !== 'combinedConsumptionMin' && key !== 'combinedConsumptionMax')
        .map(key => `${key}=${encodeURIComponent(filters[key])}`)
        .join('&');

      if (filters.combinedConsumptionMin || filters.combinedConsumptionMax) {
        const consumptionQuery = [
          filters.combinedConsumptionMin && `min_comb_mpg=${filters.combinedConsumptionMin}`,
          filters.combinedConsumptionMax && `max_comb_mpg=${filters.combinedConsumptionMax}`
        ].filter(Boolean).join('&');
        
        queryString += (queryString ? '&' : '') + consumptionQuery;
      }
      
      if (!queryString) {
        queryString = 'model=all';
      }
  
      const url = `https://api.api-ninjas.com/v1/cars?${queryString}&limit=200`;
      const response = await fetch(url, {
        headers: { 'X-Api-Key': 'API_KEY******' },
      });
      
      if (!response.ok) {
        throw new Error('No hay respuesta del servidor');
      }
      const data = await response.json();
      setCars(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars(filters);
  }, [filters]);

  useEffect(() => {
    const indexOfLastCar = currentPage * carsPerPage;
    const indexOfFirstCar = indexOfLastCar - carsPerPage;
    setDisplayCars(allCars.slice(indexOfFirstCar, indexOfLastCar));
  }, [allCars, currentPage]);

  const totalPages = Math.ceil(allCars.length / carsPerPage);

  const handleSelectCar = (car) => {
    const coordinates = getRandomCoordinates();
    setSelectedCar({ ...car, location: coordinates });
    setCurrentView('details');
  };

  return (
    <div className="flex flex-col h-screen font-roboto">
      <header className="bg-gray-800 text-white py-4 px-6 flex items-center justify-between relative">
        <img src="lgoo-drivin.webp" alt="logo drivin" className="w-24 mr-4 lg:absolute lg:left-4"/>
        <h1 className="text-2xl font-bold flex-grow text-center">Información de Autos</h1>
        <div className="w-24"></div> 
      </header>

      {currentView === 'table' ? (
        <div className="flex flex-grow flex-col lg:flex-row">
          <aside className="w-full lg:w-1/4 p-4 bg-gray-100">
            <Filters filters={filters} setFilters={setFilters} applyFilters={fetchCars} />
          </aside>
          <main className="flex-grow p-4 border-1 border-gray-100 shadow-md">
            <Table
              cars={displayCars}
              loading={loading}
              error={error}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              onSelectCar={handleSelectCar}
            />
          </main>
        </div>
      ) : (
        <main className="flex-grow p-4 border-1 border-gray-100 shadow-md">
          <CarDetails car={selectedCar} onBack={() => setCurrentView('table')} />
        </main>
      )}
    </div>
  );
}

export default App;
