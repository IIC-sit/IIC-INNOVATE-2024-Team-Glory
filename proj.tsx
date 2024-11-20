'use client'

import React, { useState } from 'react'
import { Sprout, Search, Sun, Cloud, Droplet, Wind, Salad, Cherry, Leaf, Thermometer, Zap, ArrowLeft, X, Carrot, Flower, SproutIcon as Broccoli } from 'lucide-react'

export default function Component() {
  const [weather, setWeather] = useState(null)
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCrop, setSelectedCrop] = useState(null)
  const [selectedFeature, setSelectedFeature] = useState(null)

  const handleLocationSubmit = async (location) => {
    setLoading(true)
    const weatherData = await fetchWeatherData(location)
    setWeather(weatherData)

    if (weatherData) {
      const cropData = await fetchCropRecommendations(weatherData.temperature)
      setCrops(cropData)
    }
    setLoading(false)
  }

  const fetchWeatherData = async (location) => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY || 'bd5e378503939ddaee76f12ad7a97608'
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`

    try {
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch weather data')
      }

      const data = await response.json()
      return {
        city: data.name,
        temperature: data.main.temp.toFixed(1),
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: (data.wind.speed * 3.6).toFixed(1),
      }
    } catch (error) {
      console.error('Error fetching weather data:', error)
      return null
    }
  }

  const fetchCropRecommendations = async (temperature) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  
    const response = await fetch('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/processed_crops_with_humidity_cleaned-ku5KWUGcX8PZ8BX4ptTfkNqMBm5bzC.json');
    const allCrops = await response.json();

    const celsiusTemp = parseFloat(temperature);
    return allCrops.filter(crop => {
      const minTempCelsius = (crop.temp_min - 32) * 5/9;
      const maxTempCelsius = (crop.temp_max - 32) * 5/9;
      return celsiusTemp >= minTempCelsius && celsiusTemp <= maxTempCelsius;
    }).map(crop => ({
      ...crop,
      icon: getIconForCrop(crop["Crop Name"]),
      temp: `${crop.temp_min}°F-${crop.temp_max}°F (${((crop.temp_min - 32) * 5/9).toFixed(1)}°C-${((crop.temp_max - 32) * 5/9).toFixed(1)}°C)`,
    }));
  }

  const getIconForCrop = (cropName) => {
    const leafyGreens = ['Mizuna', 'Lettuce', 'Spinach', 'Kale', 'Arugula', 'Swiss Chard', 'Bok Choy', 'Mustard Greens', 'Collard Greens', 'Watercress', 'Sorrel'];
    const herbs = ['Basil', 'Mint', 'Cilantro', 'Parsley', 'Dill', 'Oregano', 'Rosemary', 'Sage', 'Tarragon', 'Chervil', 'Stevia', 'Bay Leaf'];
    const fruiting = ['Tomatoes', 'Peppers', 'Cucumbers', 'Eggplants', 'Green Beans', 'Peas', 'Okra', 'Melons', 'Pumpkins', 'Tomato', 'Habanero Peppers'];
    const root = ['Carrots', 'Radishes', 'Beets', 'Turnips', 'Parsnips', 'Sweet Potatoes', 'Kohlrabi'];
    const flowers = ['Sunflowers', 'Nasturtiums', 'Violas', 'Pansies', 'Calendula', 'Borage', 'Chamomile', 'Hibiscus', 'Dandelions'];
    const brassicas = ['Broccoli', 'Cauliflower', 'Cabbage', 'Brussels Sprouts'];
    const alliums = ['Leeks', 'Scallions'];
    const microgreens = ['Sunflower Microgreens', 'Pea Shoots', 'Beet Microgreens', 'Alfalfa', 'Fenugreek'];

    if (leafyGreens.includes(cropName)) return 'leaf';
    if (herbs.includes(cropName)) return 'herb';
    if (fruiting.includes(cropName)) return 'cherry';
    if (root.includes(cropName)) return 'carrot';
    if (flowers.includes(cropName)) return 'flower';
    if (brassicas.includes(cropName)) return 'broccoli';
    if (alliums.includes(cropName)) return 'onion';
    if (microgreens.includes(cropName)) return 'sprout';
    return 'sprout';
  }

  return (
    <div className="font-sans min-h-screen flex flex-col relative bg-gradient-to-br from-green-50 to-green-100">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-15"
        style={{ 
          backgroundImage: "url('https://svnfgrmrbsapumslcnqx.supabase.co/storage/v1/object/public/images/light-plant-background.png')",
          mixBlendMode: "soft-light" 
        }}
      ></div>
      <div className="relative z-10 flex-grow flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col items-center p-8 gap-8 animate-fadeIn">
          {!weather && !selectedCrop && <WelcomeSection />}
          {!selectedCrop && <LocationForm onSubmit={handleLocationSubmit} loading={loading} />}
          {!weather && !selectedCrop && <FeaturesSection onFeatureSelect={setSelectedFeature} />}
          {weather && !selectedCrop && <WeatherDisplay weather={weather} />}
          {crops.length > 0 && !selectedCrop && (
            <>
              <div className="text-center text-xl text-gray-700 mb-4">
                Showing crops suitable for {weather.temperature}°C
              </div>
              <CropList crops={crops} onCropSelect={setSelectedCrop} />
            </>
          )}
          {crops.length === 0 && weather && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center max-w-md">
              <h3 className="text-xl font-semibold text-yellow-800 mb-2">No Suitable Crops Found</h3>
              <p className="text-gray-600">
                The current temperature in your location ({weather.temperature}°C) is not optimal for our recommended crops. 
                Consider using climate control systems to adjust the growing environment.
              </p>
            </div>
          )}
          {selectedCrop && (
            <CropDetails
              crop={selectedCrop}
              onBack={() => setSelectedCrop(null)}
            />
          )}
          {selectedFeature && (
            <FeatureExplanation
              feature={selectedFeature}
              onClose={() => setSelectedFeature(null)}
            />
          )}
        </main>
        <Footer />
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex items-center justify-center shadow-lg">
      <div className="container mx-auto flex items-center justify-center">
        <Sprout className="w-10 h-10 mr-4 animate-pulse" />
        <h1 className="text-3xl font-bold tracking-tight">Vertical Farming Assistant</h1>
      </div>
    </header>
  )
}

function WelcomeSection() {
  return (
    <section className="text-center max-w-4xl mx-auto mb-8 bg-white bg-opacity-90 rounded-xl shadow-xl p-8">
      <h2 className="text-4xl font-bold text-green-800 mb-4">Welcome to Your Vertical Farming Journey</h2>
      <p className="text-xl text-gray-700 mb-6">
        Discover the perfect crops for your urban garden based on your local weather conditions.
        Enter your city below to get started!
      </p>
      <div className="flex justify-center space-x-4">
        <Sprout className="w-16 h-16 text-green-600" />
        <Thermometer className="w-16 h-16 text-red-500" />
        <Droplet className="w-16 h-16 text-blue-500" />
      </div>
    </section>
  )
}

function LocationForm({ onSubmit, loading }) {
  const [location, setLocation] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(location)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md bg-white bg-opacity-90 rounded-xl shadow-xl p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <label htmlFor="location-input" className="sr-only">Enter your city</label>
        <input
          id="location-input"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Enter your city"
          className={`flex-grow px-4 py-3 rounded-lg border-2 border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg shadow-inner ${
            isFocused ? 'bg-green-100' : 'bg-white'
          }`}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          ) : (
            <>
              <Search className="w-6 h-6" />
              Search
            </>
          )}
        </button>
      </div>
    </form>
  )
}

function FeaturesSection({ onFeatureSelect }) {
  const features = [
    { icon: <Sun className="w-12 h-12 text-yellow-500" />, title: "Weather Analysis", description: "Get real-time weather data for your location", explanation: "Our advanced algorithms analyze local weather patterns to provide you with accurate, up-to-date information tailored to your vertical farming needs." },
    { icon: <Sprout className="w-12 h-12 text-green-600" />, title: "Crop Recommendations", description: "Receive personalized crop suggestions", explanation: "Based on your local climate and weather conditions, we suggest the most suitable crops for your vertical farm, ensuring optimal growth and yield." },
    { icon: <Zap className="w-12 h-12 text-blue-500" />, title: "Efficiency Tips", description: "Learn how to optimize your vertical farm", explanation: "Discover innovative techniques and best practices to maximize the efficiency of your vertical farming setup, from resource management to space utilization." },
  ]

  return (
    <section className="w-full max-w-4xl mx-auto mt-12 bg-white bg-opacity-90 rounded-xl shadow-xl p-6">
      <h2 className="text-3xl font-bold text-center text-green-800 mb-8">Our Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center transition-all hover:shadow-lg hover:-translate-y-1 hover:bg-green-200 cursor-pointer"
            onClick={() => onFeatureSelect(feature)}
          >
            {feature.icon}
            <h3 className="text-xl font-semibold mt-4 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FeatureExplanation({ feature, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-green-800">{feature.title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close feature explanation">
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-600 mb-4">{feature.explanation}</p>
        <div className="flex justify-center">
          {feature.icon}
        </div>
      </div>
    </div>
  )
}

function WeatherDisplay({ weather }) {
  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'clear sky':
        return <Sun className="w-16 h-16 text-yellow-500" />
      case 'few clouds':
      case 'scattered clouds':
      case 'broken clouds':
        return <Cloud className="w-16 h-16 text-gray-500" />
      default:
        return <Cloud className="w-16 h-16 text-gray-500" />
    }
  }

  return (
    <div className="bg-white bg-opacity-90 rounded-xl shadow-xl p-8 text-center w-full max-w-md transform transition-all hover:scale-105">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">{weather.city}</h2>
      <div className="flex items-center justify-center mb-6">
        {getWeatherIcon(weather.condition)}
        <span className="text-5xl font-bold text-green-600 ml-4">{weather.temperature}°C</span>
      </div>
      <div className="text-xl text-gray-600 mb-6 capitalize">{weather.condition}</div>
      <div className="flex justify-around text-gray-700">
        <div className="flex items-center">
          <Droplet className="w-6 h-6 text-blue-500 mr-2" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center">
          <Wind className="w-6 h-6 text-gray-500 mr-2" />
          <span>{weather.windSpeed} km/h</span>
        </div>
      </div>
    </div>
  )
}

function CropList({ crops, onCropSelect }) {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'leaf':
        return <Leaf className="w-12 h-12 text-green-500" />
      case 'herb':
        return <Sprout className="w-12 h-12 text-green-600" />
      case 'cherry':
        return <Cherry className="w-12 h-12 text-red-500" />
      case 'carrot':
        return <Carrot className="w-12 h-12 text-orange-500" />
      case 'flower':
        return <Flower className="w-12 h-12 text-purple-500" />
      case 'broccoli':
        return <Broccoli className="w-12 h-12 text-green-700" />
      case 'onion':
        return <Sprout className="w-12 h-12 text-green-600" />
      default:
        return <Sprout className="w-12 h-12 text-green-500" />
    }
  }

  return (
    <div className="w-full max-w-4xl bg-white bg-opacity-90 rounded-xl shadow-xl p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Recommended Crops</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {crops.map((crop, index) => (
          <div
            key={index}
            className="bg-white bg-opacity-90 rounded-lg shadow-md p-6 flex flex-col items-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
            onClick={() => onCropSelect(crop)}
          >
            {getIcon(crop.icon)}
            <h3 className="text-lg font-semibold mt-4 mb-2">{crop["Crop Name"]}</h3>
            <p className="text-gray-600">{crop.temp}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CropDetails({ crop, onBack }) {
  return (
    <div className="bg-white rounded-xl shadow-xl p-8 max-w-3xl mx-auto relative">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Crops
      </button>
      <h2 className="text-3xl font-bold text-green-800 mb-4 text-center">{crop["Crop Name"]}</h2>
      <div className="flex justify-center mb-4">
        {getIcon(crop.icon)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Planting</h3>
          <p>{crop.Planting}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Harvesting</h3>
          <p>{crop.Harvesting}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Temperature</h3>
          <p>Range: {crop["Temperature Range"]}</p>
          <p>Ideal: {crop["Temperature Ideal"]}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Light</h3>
          <p>{crop["Light Hours"]}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">pH Level</h3>
          <p>{crop["pH Range"]}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Humidity</h3>
          <p>{crop.Humidity}%</p>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="font-semibold text-green-800 mb-2">Nutrient Requirements</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Object.entries(crop["Nutrient Requirements"]).map(([nutrient, value]) => (
            <div key={nutrient} className="bg-blue-50 p-2 rounded-lg text-center">
              <p className="font-medium">{nutrient}</p>
              <p>{value} ppm</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const getIcon = (iconName) => {
  switch (iconName) {
    case 'leaf':
      return <Leaf className="w-12 h-12 text-green-500" />
    case 'herb':
      return <Sprout className="w-12 h-12 text-green-600" />
    case 'cherry':
      return <Cherry className="w-12 h-12 text-red-500" />
    case 'carrot':
      return <Carrot className="w-12 h-12 text-orange-500" />
    case 'flower':
      return <Flower className="w-12 h-12 text-purple-500" />
    case 'broccoli':
      return <Broccoli className="w-12 h-12 text-green-700" />
    case 'onion':
      return <Sprout className="w-12 h-12 text-green-600" />
    default:
      return <Sprout className="w-12 h-12 text-green-500" />
  }
}

function Footer() {
  return (
    <footer className="bg-green-800 text-green-100 py-4 text-center">
      <p>&copy; 2024 Vertical Farming Assistant. All rights reserved.</p>
    </footer>
  )
}
