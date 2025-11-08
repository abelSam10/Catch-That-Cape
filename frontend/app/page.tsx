"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import ReportSightingForm from "../components/ReportSightingForm";

// ------------------------------------------------------------
// 🎃 THEME + HALLOWEEN DECORATIONS
// ------------------------------------------------------------
const THEME = {
  bg: "#0a0f09",
  panel: "#162314",
  neon: "#A6FF47",
  accent: "#FF7518",
  text: "#F5FFDC",
  subtext: "#D9F9A6",
};

function HalloweenBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* dark gradient + fog overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f09] via-[#132215] to-black animate-pulseSlow"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-fog.png')] opacity-25 mix-blend-overlay"></div>

      {/* pumpkins floating */}
      <img
        src="https://pngimg.com/uploads/halloween/halloween_PNG105.png"
        alt="pumpkin left"
        className="absolute bottom-2 left-4 w-20 opacity-90 animate-floatPumpkin"
      />
      <img
        src="https://pngimg.com/uploads/halloween/halloween_PNG98.png"
        alt="pumpkin right"
        className="absolute bottom-2 right-4 w-20 opacity-90 animate-floatPumpkin delay-1000"
      />
    </div>
  );
}

function BackgroundAudio() {
  useEffect(() => {
    const audio = new Audio(
      "https://cdn.pixabay.com/download/audio/2023/10/16/audio_d4c9be1adf.mp3?filename=horror-ambience-175066.mp3"
    );
    audio.loop = true;
    audio.volume = 0.3;
    audio.play().catch(() => console.log("Audio autoplay blocked until user interacts."));
    return () => audio.pause();
  }, []);
  return null;
}

// ------------------------------------------------------------
// 🗺️ LEAFLET INITIALIZATION
// ------------------------------------------------------------
const L: any = typeof window !== "undefined" ? require("leaflet") : null;

if (L) {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
  });
}

// ------------------------------------------------------------
// 🧭 MAIN COMPONENT
// ------------------------------------------------------------
export default function Home() {
  // 🎃 jumpscare state
  const [jumpscare, setJumpscare] = useState(false);
  function triggerJumpscare() {
    const scream = new Audio(
      "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c1c1e34b41.mp3?filename=scream-112253.mp3"
    );
    scream.volume = 0.7;
    scream.play();
    setJumpscare(true);
    setTimeout(() => setJumpscare(false), 2500);
  }

  // 🗺️ Map refs
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const latestMarkerRef = useRef<any>(null);
  const latestCircleRef = useRef<any>(null);

  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | undefined>(undefined);

  // 🌍 Initialize map once
  useEffect(() => {
    if (!L || mapRef.current) return;

    const map = L.map("map", { center: [45.5579, -94.1632], zoom: 13 });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    // click to place marker
    map.on("click", (e: any) => {
      const { lat, lng } = e.latlng;
      setLatLng({ lat, lng });

      if (!markerRef.current) markerRef.current = L.marker([lat, lng]).addTo(map);
      else markerRef.current.setLatLng([lat, lng]);

      if (!circleRef.current) circleRef.current = L.circle([lat, lng], { radius: 15 }).addTo(map);
      else circleRef.current.setLatLng([lat, lng]);
    });

    const id = setInterval(loadLatest, 7000);
    loadLatest();

    return () => {
      clearInterval(id);
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔁 Load latest sightings (MongoDB)
  async function loadLatest() {
    try {
      const r = await fetch(`http://localhost:3000/api/sightings/latest`);
      if (!r.ok) return;
      const d = await r.json();
      if (!d) return;

      const [lng, lat] = d.loc.coordinates as [number, number];
      const acc = d.accuracyM ?? 20;
      const map = mapRef.current as any;

      if (!latestMarkerRef.current)
        latestMarkerRef.current = L.marker([lat, lng], { title: "Latest sighting" }).addTo(map);
      latestMarkerRef.current.setLatLng([lat, lng]).bindPopup(d.description || "Latest sighting");

      if (!latestCircleRef.current)
        latestCircleRef.current = L.circle([lat, lng], { radius: acc, color: "#2563eb" }).addTo(map);
      else latestCircleRef.current.setLatLng([lat, lng]).setRadius(acc);
    } catch (err) {
      console.warn("Failed to load latest sighting", err);
    }
  }

  // 📍 Use my location
  function useMyLocation() {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatLng({ lat, lng });

        const map = mapRef.current as any;
        map?.setView([lat, lng], 16);

        if (!markerRef.current) markerRef.current = L.marker([lat, lng]).addTo(map);
        else markerRef.current.setLatLng([lat, lng]);

        if (!circleRef.current) circleRef.current = L.circle([lat, lng], { radius: 15 }).addTo(map);
        else circleRef.current.setLatLng([lat, lng]);
      },
      () => alert("Unable to fetch your location")
    );
  }

  // ------------------------------------------------------------
  // 🕸️ RENDER
  // ------------------------------------------------------------
  return (
    <main className={`relative min-h-screen p-6 text-[${THEME.text}] bg-[${THEME.bg}] overflow-hidden`}>
      {/* spooky overlays */}
      <HalloweenBackground />
      <BackgroundAudio />

      {/* jumpscare */}
      {jumpscare && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 animate-fadeIn">
          <img src="/huntedSuperman.png" alt="Haunted Superman" className="w-2/3 max-w-lg animate-shakeFast" />
        </div>
      )}

      {/* main container */}
      <div className="max-w-6xl mx-auto space-y-4 relative z-10">
        <header className="text-center">
          <h1
            onClick={triggerJumpscare}
            className="text-5xl font-extrabold bg-gradient-to-r from-[#A6FF47] to-[#FF7518] bg-clip-text text-transparent drop-shadow-[0_0_8px_#A6FF47]/40 tracking-wide cursor-pointer"
          >
            St. Cloud Superman Tracker
          </h1>
          <p className="text-[#D9F9A6] italic mt-2 mb-4">
            Report your sightings below 👇 — or... something darker 👻
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
          <div className="relative">
            <div id="map" className="h-[70vh] w-full rounded-lg border" />
            <div className="absolute top-3 left-3 flex gap-2">
              <Button size="sm" onClick={useMyLocation}>
                Use my location
              </Button>
            </div>
          </div>

          <div className={`bg-[${THEME.panel}] border border-[${THEME.neon}]/40 rounded-xl p-4 shadow-[0_0_20px_#FF7518]/30`}>
            <ReportSightingForm
              latLng={latLng}
              onSubmitted={() => {
                if (circleRef.current) {
                  circleRef.current.remove();
                  circleRef.current = null;
                }
                if (markerRef.current) {
                  markerRef.current.remove();
                  markerRef.current = null;
                }
                setLatLng(undefined);
                loadLatest();
              }}
            />
          </div>
        </div>
      </div>

      {/* animations */}
      <style jsx global>{`
        @keyframes pulseSlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-pulseSlow { animation: pulseSlow 6s ease-in-out infinite; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-in; }

        @keyframes floatPumpkin {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-floatPumpkin { animation: floatPumpkin 4s ease-in-out infinite; }

        @keyframes shakeFast {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(10px, -10px); }
          50% { transform: translate(-10px, 10px); }
          75% { transform: translate(8px, -8px); }
        }
        .animate-shakeFast { animation: shakeFast 0.15s ease-in-out 8; }
      `}</style>
    </main>
  );
}
