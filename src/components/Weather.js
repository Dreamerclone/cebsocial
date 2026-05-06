'use client';

import React, { useState, useEffect } from 'react';
import { CloudLightning, Sun, Cloud, CloudRain } from 'lucide-react';
import { useSocial } from '../contexts/SocialContext';

export default function Weather() {
  const { t } = useSocial();
  const [weather, setWeather] = useState({ temp: 29, condition: 'Partly Cloudy', humidity: 78, wind: 12 });

  useEffect(() => {
    // Fetch real weather data from Open-Meteo (Free, no key required)
    const fetchWeather = async () => {
        try {
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=10.3157&longitude=123.8854&current_weather=true&hourly=relativehumidity_2m,windspeed_10m');
            const data = await res.json();
            if (data.current_weather) {
                setWeather({
                    temp: Math.round(data.current_weather.temperature),
                    condition: data.current_weather.weathercode < 3 ? 'Sunny' : data.current_weather.weathercode < 50 ? 'Cloudy' : 'Rainy',
                    humidity: data.hourly.relativehumidity_2m[0],
                    wind: Math.round(data.current_weather.windspeed)
                });
            }
        } catch (e) {
            console.error('Weather fetch error:', e);
        }
    };
    fetchWeather();
  }, []);

  const WeatherIcon = () => {
      if (weather.condition === 'Sunny') return <Sun size={80} />;
      if (weather.condition === 'Rainy') return <CloudRain size={80} />;
      return <Cloud size={80} />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm bg-gradient-to-br from-blue-500 to-blue-700 text-white relative overflow-hidden transition-all hover:shadow-lg">
        <div className="absolute top-0 right-0 p-4 opacity-20">
            <WeatherIcon />
        </div>
        <div className="relative">
            <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 italic">{t.weather_city}</p>
                <span className="bg-white/20 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse">Live</span>
            </div>
            <div className="flex items-end space-x-2">
                <h2 className="text-4xl font-black italic tracking-tighter">{weather.temp}°C</h2>
                <p className="text-[10px] font-bold uppercase opacity-80 pb-1">{weather.condition}</p>
            </div>
            <div className="mt-4 flex space-x-4 border-t border-white/10 pt-4">
                <div className="text-center">
                    <p className="text-[8px] font-black uppercase opacity-60">Humidity</p>
                    <p className="text-[10px] font-bold">{weather.humidity}%</p>
                </div>
                <div className="text-center">
                    <p className="text-[8px] font-black uppercase opacity-60">Wind</p>
                    <p className="text-[10px] font-bold">{weather.wind} km/h</p>
                </div>
            </div>
        </div>
    </div>
  );
}
