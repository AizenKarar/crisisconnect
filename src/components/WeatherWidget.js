'use client'
import { useState, useEffect } from 'react'

export default function WeatherWidget() {
    const [weather, setWeather] = useState(null)
    const [locationName, setLocationName] = useState('Fetching...')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        if (!navigator.geolocation) {
            setError(true)
            setLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude
            const lon = position.coords.longitude

            try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                if (geoRes.ok) {
                    const geoData = await geoRes.json()
                    let city = geoData.address.city || geoData.address.state_district || geoData.address.town || 'Local Area'
                    setLocationName(city)
                }

                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
                if (weatherRes.ok) {
                    const weatherData = await weatherRes.json()
                    setWeather(weatherData.current_weather)
                }
            } catch (err) {
                setError(true)
            }
            setLoading(false)
        }, () => {
            setError(true)
            setLoading(false)
        })
    }, [])

    function getWeatherDesc(code) {
        if (code === 0) return { text: 'Clear Sky', icon: '☀️' }
        if (code >= 1 && code <= 3) return { text: 'Partly Cloudy', icon: '⛅' }
        if (code === 45 || code === 48) return { text: 'Foggy', icon: '🌫️' }
        if (code >= 51 && code <= 67) return { text: 'Raining', icon: '🌧️' }
        if (code >= 71 && code <= 77) return { text: 'Snowing', icon: '❄️' }
        if (code >= 95) return { text: 'Thunderstorm', icon: '⛈️' }
        return { text: 'Unknown', icon: '🌡️' }
    }

    if (loading) {
        return <div className="h-24 bg-slate-100 animate-pulse rounded-2xl mb-6"></div>
    }

    if (error || !weather) {
        return null
    }

    const { text, icon } = getWeatherDesc(weather.weathercode)

    return (
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-6 mb-6 text-white shadow-lg flex items-center justify-between">
            <div>
                <p className="text-teal-100 text-sm font-medium uppercase tracking-wider mb-1">Current Conditions</p>
                <h2 className="text-2xl font-bold font-display">{locationName}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-teal-50">
                    <span className="flex items-center gap-1">💨 Wind: {weather.windspeed} km/h</span>
                </div>
            </div>
            <div className="text-right flex items-center gap-4">
                <div className="text-5xl">{icon}</div>
                <div>
                    <p className="text-4xl font-bold">{weather.temperature}°C</p>
                    <p className="text-teal-100 font-medium">{text}</p>
                </div>
            </div>
        </div>
    )
}