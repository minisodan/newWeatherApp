import React, { useState, useEffect } from "react";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faCloud,
  faCloudSun,
  faCloudRain,
  faSnowflake,
  faSmog,
} from "@fortawesome/free-solid-svg-icons";


function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDayTime, setIsDayTime] = useState(true);
  const [autoFetched, setAutoFetched] = useState(false);

  useEffect(() => {
    if (!autoFetched) {
      fetchCurrentLocation();
    }

   const currentTime = new Date();
   const currentHour = currentTime.getHours();
   setIsDayTime(currentHour >= 6 && currentHour < 18);

  }, [autoFetched]);

  const fetchCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
        try {
          const response = await fetch(geoUrl);
          const data = await response.json();
          const cityName = data.city || `${data.locality}, ${data.countryName}`;
          setCity(cityName);
          setAutoFetched(true);
          fetchWeather(cityName);
        } catch (error) {
          console.error("Error fetching city name:", error);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setAutoFetched(true);
      }
    );
  };

  const fetchWeather = async (city) => {
    const apiKey = "7JVVGJTXRMAFYKBP5VB36SRV8";
    if (!apiKey) {
      console.error("API key is not defined");
      return;
    }

    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?key=${apiKey}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      const data = await response.json();
      setWeatherData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (city) {
      fetchWeather(city);
    } else {
      console.error("City name is empty");
    }
  };

  const getWeatherIcon = (condition, color) => {
    switch (condition) {
      case "Clear":
        return <FontAwesomeIcon icon={faSun} style={{ color }} />;
      case "Partially cloudy":
        return <FontAwesomeIcon icon={faCloudSun} style={{ color }} />;
      case "Cloudy":
        return <FontAwesomeIcon icon={faCloud} style={{ color }} />;
      case "Rain":
        return <FontAwesomeIcon icon={faCloudRain} style={{ color }} />;
      case "Snow":
        return <FontAwesomeIcon icon={faSnowflake} style={{ color }} />;
      case "Fog":
        return <FontAwesomeIcon icon={faSmog} style={{ color }} />;
      default:
        return null;
    }
  };


  const getIconColor = (condition) => {
    switch (condition) {
      case "Clear":
        return "#FEE715"; // Yellow for clear sky
      case "Partially cloudy":
        return "#B0C4DE"; // Light blue for partially cloudy
      case "Cloudy":
        return "#808080"; // Gray for cloudy
      case "Rain":
        return "#4682B4"; // Blue for rain
      case "Snow":
        return "#FFFFFF"; // White for snow
      case "Fog":
        return "#D3D3D3"; // Light gray for fog
      default:
        return "#000000"; // Default to black
    }
  };

  const getDayOfWeek = (dateString, index) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    const date = new Date(dateString);
    date.setUTCDate(today.getUTCDate() + index); // Adjust the date to get the next day in UTC
    return days[date.getUTCDay()];
  };





  const formatEpochTime = (epoch) => {
    const date = new Date(epoch * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };


  return (
    <div className={`App ${isDayTime ? "day-background" : "night-background"}`}>
      <div className="container mt-5">
        <div
          className="card"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}
        >
          <div className="card-header">
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search for a city..."
                aria-label="Search"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <div className="input-group-append">
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            {loading ? (
              <div>Loading...</div>
            ) : (
              weatherData && (
                <div>
                  <h3>Todays Weather in {weatherData.resolvedAddress}</h3>
                  <p>Temperature: {weatherData.currentConditions.temp}°F</p>
                  <p>Feels Like: {weatherData.currentConditions.feelslike}°F</p>
                  <p>
                    Condition: {weatherData.currentConditions.conditions}{" "}
                    {getWeatherIcon(
                      weatherData.currentConditions.conditions,
                      getIconColor(weatherData.currentConditions.conditions)
                    )}
                  </p>
                  <p>Weather Description: {weatherData.description}</p>
                  <p>
                    Sunrise:{" "}
                    {formatEpochTime(
                      weatherData.currentConditions.sunriseEpoch
                    )}
                  </p>
                  <p>
                    Sunset:{" "}
                    {formatEpochTime(weatherData.currentConditions.sunsetEpoch)}
                  </p>
                </div>
              )
            )}

            <div className="row">
              {weatherData &&
                weatherData.days.slice(0, 7).map((day, index) => (
                  <div
                    className="col"
                    key={index}
                    style={{ marginBottom: "15px" }}
                  >
                    <div className="card">
                      <div className="card-body" style={{ height: "230px" }}>
                        <h5 className="card-title">
                          {getDayOfWeek(day.datetime, index)}
                        </h5>
                        <p className="card-text">Temperature: {day.temp}°F</p>
                        <p className="card-text">
                          Condition: {day.conditions}{" "}
                          {getWeatherIcon(
                            day.conditions,
                            getIconColor(day.conditions)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
