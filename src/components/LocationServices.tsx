import React, { useState } from 'react';
import { useLocale } from '../context/LocaleContext';
import { useCase } from '../context/CaseContext';
import { GPSLocation } from '../types';
import {
  MapPin,
  Navigation,
  Shield,
  Phone,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Compass,
  FileCheck,
  Copy,
  ArrowUpRight,
  Crosshair,
  ShieldAlert,
} from 'lucide-react';

interface CyberStationInfo {
  name: string;
  unit: string;
  address: string;
  helpline: string;
  lat: number;
  lng: number;
  jurisdiction: string;
}

// Sample verified cyber police headquarters across India
const CYBER_STATIONS: CyberStationInfo[] = [
  {
    name: 'Special Cell Cyber Crime Police Station (IFSO)',
    unit: 'Delhi Police Cyber Cell',
    address: 'Sector 16B, Dwarka, New Delhi - 110078',
    helpline: '1930 / 011-20892633',
    lat: 28.5921,
    lng: 77.046,
    jurisdiction: 'Delhi NCR',
  },
  {
    name: 'Maharashtra Cyber Police Headquarters',
    unit: 'Maharashtra State Cyber Crime Investigation Cell',
    address: 'World Trade Centre, Cuffe Parade, Mumbai - 400005',
    helpline: '1930 / 022-22160080',
    lat: 18.9186,
    lng: 72.8228,
    jurisdiction: 'Maharashtra',
  },
  {
    name: 'Cyber Crime Police Station (CID Karnataka)',
    unit: 'Karnataka CID Cyber Crime Wing',
    address: 'Carlton House, Palace Road, Bengaluru - 560001',
    helpline: '1930 / 080-22094498',
    lat: 12.9822,
    lng: 77.5898,
    jurisdiction: 'Karnataka',
  },
  {
    name: 'Cyber Crime Police Station (Cyberabad)',
    unit: 'Telangana Cyber Security Bureau (TGCSB)',
    address: 'Cyberabad Police Commissionerate, Gachibowli, Hyderabad - 500032',
    helpline: '1930 / 040-27853412',
    lat: 17.4399,
    lng: 78.3606,
    jurisdiction: 'Telangana',
  },
  {
    name: 'Tamil Nadu Cyber Crime Wing',
    unit: 'State Cyber Crime Investigation Centre',
    address: 'Police Headquarters, Dr. Radhakrishnan Salai, Mylapore, Chennai - 600004',
    helpline: '1930 / 044-28447701',
    lat: 13.0418,
    lng: 80.2644,
    jurisdiction: 'Tamil Nadu',
  },
  {
    name: 'West Bengal Cyber Crime Police Station',
    unit: 'CID West Bengal Cyber Patrol',
    address: 'Bhabani Bhaban, Alipore, Kolkata - 700027',
    helpline: '1930 / 033-24791077',
    lat: 22.528,
    lng: 88.328,
    jurisdiction: 'West Bengal',
  },
  {
    name: 'Gujarat Cyber Crime Police Station (CID Crime)',
    unit: 'Gujarat State Cyber Cell',
    address: 'Police Bhavan, Sector 18, Gandhinagar, Gujarat - 382018',
    helpline: '1930 / 079-23254383',
    lat: 23.223,
    lng: 72.6492,
    jurisdiction: 'Gujarat',
  },
  {
    name: 'Uttar Pradesh Cyber Crime Police Station',
    unit: 'UP Police State Cyber Headquarters',
    address: 'Signatures Building, Gomti Nagar Extension, Lucknow - 226010',
    helpline: '1930 / 0522-2720200',
    lat: 26.8467,
    lng: 81.0118,
    jurisdiction: 'Uttar Pradesh',
  },
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const LocationServices: React.FC = () => {
  const { setRegionCode, t } = useLocale();
  const { activeDraftCase, updateActiveCaseDetails } = useCase();

  const [loading, setLoading] = useState<boolean>(false);
  const [gpsData, setGpsData] = useState<GPSLocation | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);
  const [stampedInCase, setStampedInCase] = useState<boolean>(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setPermissionDenied(true);
      return;
    }

    setLoading(true);
    setPermissionDenied(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 15);
        const altitude = position.coords.altitude ? Math.round(position.coords.altitude) : null;
        const timestamp = position.timestamp || Date.now();

        let city = 'Detecting...';
        let district = '';
        let state = 'India';
        let postalCode = '';
        let formattedAddress = `${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`;
        let matchCode = 'IN-ALL';

        // Approximate state fallback logic
        if (lat >= 28.3 && lat <= 28.9 && lng >= 76.8 && lng <= 77.4) {
          city = 'New Delhi';
          state = 'Delhi NCR';
          matchCode = 'IN-DL';
        } else if (lat >= 18.8 && lat <= 19.3 && lng >= 72.7 && lng <= 73.2) {
          city = 'Mumbai';
          state = 'Maharashtra';
          matchCode = 'IN-MH';
        } else if (lat >= 12.8 && lat <= 13.2 && lng >= 77.4 && lng <= 77.8) {
          city = 'Bengaluru';
          state = 'Karnataka';
          matchCode = 'IN-KA';
        } else if (lat >= 12.9 && lat <= 13.3 && lng >= 80.1 && lng <= 80.4) {
          city = 'Chennai';
          state = 'Tamil Nadu';
          matchCode = 'IN-TN';
        } else if (lat >= 17.2 && lat <= 17.6 && lng >= 78.2 && lng <= 78.6) {
          city = 'Hyderabad';
          state = 'Telangana';
          matchCode = 'IN-TS';
        } else if (lat >= 22.4 && lat <= 22.7 && lng >= 88.2 && lng <= 88.5) {
          city = 'Kolkata';
          state = 'West Bengal';
          matchCode = 'IN-WB';
        } else if (lat >= 22.9 && lat <= 23.2 && lng >= 72.4 && lng <= 72.7) {
          city = 'Ahmedabad';
          state = 'Gujarat';
          matchCode = 'IN-GJ';
        } else if (lat >= 26.7 && lat <= 27.0 && lng >= 80.8 && lng <= 81.1) {
          city = 'Lucknow';
          state = 'Uttar Pradesh';
          matchCode = 'IN-UP';
        }

        // Try OpenStreetMap Nominatim Reverse Geocoding with timeout
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data.address) {
              city =
                data.address.city ||
                data.address.town ||
                data.address.suburb ||
                data.address.village ||
                city;
              district = data.address.state_district || data.address.county || '';
              state = data.address.state || state;
              postalCode = data.address.postcode || '';
              formattedAddress = data.display_name || formattedAddress;

              // Match region code
              if (state.toLowerCase().includes('delhi')) matchCode = 'IN-DL';
              else if (state.toLowerCase().includes('maharashtra')) matchCode = 'IN-MH';
              else if (state.toLowerCase().includes('karnataka')) matchCode = 'IN-KA';
              else if (state.toLowerCase().includes('tamil nadu')) matchCode = 'IN-TN';
              else if (state.toLowerCase().includes('telangana')) matchCode = 'IN-TS';
              else if (state.toLowerCase().includes('bengal')) matchCode = 'IN-WB';
              else if (state.toLowerCase().includes('gujarat')) matchCode = 'IN-GJ';
              else if (state.toLowerCase().includes('pradesh')) matchCode = 'IN-UP';
            }
          }
        } catch (e) {
          console.log('Using geometric regional fallback coordinates:', e);
        }

        const resolvedGps: GPSLocation = {
          latitude: lat,
          longitude: lng,
          accuracy,
          altitude,
          timestamp,
          formattedAddress,
          city,
          district,
          state,
          postalCode,
          jurisdictionCell: `${state} Cyber Crime Police Station / National Portal 1930`,
        };

        setGpsData(resolvedGps);
        setRegionCode(matchCode);
        setLoading(false);
      },
      (err) => {
        console.warn('Geolocation denied or timeout:', err);
        setLoading(false);
        setPermissionDenied(true);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleStampToActiveCase = () => {
    if (!gpsData) return;
    updateActiveCaseDetails({
      gpsLocation: gpsData,
    });
    setStampedInCase(true);
    setTimeout(() => setStampedInCase(false), 3000);
  };

  const handleCopyCoords = () => {
    if (!gpsData) return;
    const text = `${gpsData.latitude.toFixed(6)}, ${gpsData.longitude.toFixed(6)} (Accuracy: ±${gpsData.accuracy}m, City: ${gpsData.city}, State: ${gpsData.state})`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  // Find nearest cyber stations sorted by distance
  const sortedStations = gpsData
    ? [...CYBER_STATIONS]
        .map((station) => ({
          ...station,
          distanceKm: calculateDistanceKm(
            gpsData.latitude,
            gpsData.longitude,
            station.lat,
            station.lng
          ),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
    : CYBER_STATIONS.map((s) => ({ ...s, distanceKm: 0 }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-800/60 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-teal-300 font-extrabold text-xs tracking-wider uppercase">
            <Compass className="w-4 h-4 text-teal-300 animate-spin-slow" />
            <span>Forensic GPS & Regional Jurisdictions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Live GPS Location & Cyber Police Stations
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 max-w-2xl leading-relaxed">
            Acquire high-precision coordinates for police investigation (Section 65B/63 BSA evidence compliance), locate the nearest Cyber Crime Police Station, and get instant navigation routes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: GPS Controls & Live Readout */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>GPS Hardware Acquisition</span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Live Sensor
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Fetches latitude, longitude, and accuracy radius directly via device GPS sensor.
            </p>

            <button
              onClick={handleDetectLocation}
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-slate-950 font-extrabold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Crosshair className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Acquiring GPS Fix...' : 'Acquire Live GPS Fix'}</span>
            </button>

            {permissionDenied && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-bold">GPS Access Prompt Closed</p>
                  <p className="text-[11px]">
                    Please allow location in your browser toolbar to acquire live GPS fix.
                  </p>
                </div>
              </div>
            )}

            {/* GPS Metadata Card */}
            {gpsData && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-teal-500/30 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>GPS Fix Locked</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ±{gpsData.accuracy}m accuracy
                  </span>
                </div>

                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lat / Lng:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {gpsData.latitude.toFixed(5)}°, {gpsData.longitude.toFixed(5)}°
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">City / District:</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {gpsData.city} {gpsData.district ? `(${gpsData.district})` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">State / Region:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{gpsData.state}</span>
                  </div>
                </div>

                {/* Actions: Copy & Stamp into Case */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                  <button
                    onClick={handleCopyCoords}
                    className="w-full py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCoords ? 'Copied Coordinates!' : 'Copy Coordinates'}</span>
                  </button>

                  <button
                    onClick={handleStampToActiveCase}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    title="Stamp GPS coordinates into active case report for police Section 65B/63 BSA evidence"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>
                      {stampedInCase
                        ? 'Stamped in Police Report!'
                        : 'Attach GPS to Incident Report'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Nearest Cyber Police Station & Navigation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Nearest Cyber Crime Police Station</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {gpsData
                    ? `Showing verified nearest Cyber Cell calculated from your live GPS fix`
                    : `Press "Acquire Live GPS Fix" to identify and display your single nearest Cyber Cell`}
                </p>
              </div>

              {gpsData && (
                <a
                  href={`https://www.google.com/maps/search/cyber+crime+police+station/@${gpsData.latitude},${gpsData.longitude},13z`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                >
                  <span>Search All on Map</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* If GPS is not yet acquired, prompt user to press Acquire Live GPS Fix button */}
            {!gpsData ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
                  <Crosshair className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Nearest Cyber Cell Awaiting GPS Lock
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                    Press the <strong className="text-teal-600 dark:text-teal-400">"Acquire Live GPS Fix"</strong> button on the left to locate and display your single verified nearest Cyber Crime Police Station with instant directions.
                  </p>
                </div>
                <button
                  onClick={handleDetectLocation}
                  disabled={loading}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-xs shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Acquiring GPS Fix...' : 'Acquire Live GPS Fix'}</span>
                </button>
              </div>
            ) : (
              /* ONLY show the single nearest cell when acquire live GPS fix button is pressed */
              <div className="space-y-3">
                {sortedStations.slice(0, 1).map((station) => (
                  <div
                    key={station.name}
                    className="p-5 rounded-2xl border-2 border-teal-500/50 bg-gradient-to-br from-teal-50/50 via-white to-slate-50/60 dark:from-teal-950/30 dark:via-slate-950 dark:to-slate-900 space-y-3 shadow-sm transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-base text-slate-900 dark:text-white">
                            {station.name}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Nearest Verified Cell (~{station.distanceKm} km away)
                          </span>
                        </div>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                          {station.unit}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                          {station.address}
                        </p>
                      </div>

                      {/* Navigation Link */}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${gpsData.latitude},${gpsData.longitude}&destination=${station.lat},${station.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        title="Get live GPS navigation directions to this police station"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Directions</span>
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-200 dark:border-slate-800">
                      <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="font-semibold">Helpline:</span>
                        <span className="font-mono">{station.helpline}</span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 flex items-center sm:justify-end gap-1 font-mono text-[11px]">
                        <span>Jurisdiction:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{station.jurisdiction}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* National Helpline Bar */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg">
                  1930
                </div>
                <div>
                  <div className="font-bold text-sm">National Cyber Crime Helpline (1930)</div>
                  <div className="text-xs text-slate-400">
                    Toll-free 24x7 reporting for financial cyber frauds, blackmail, and extortion
                  </div>
                </div>
              </div>
              <a
                href="tel:1930"
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all"
              >
                Call 1930 Now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Official Cyber Crime Contact Us Directory Link at Bottom of Nearby Help Page */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wide">
            <ExternalLink className="w-4 h-4" />
            <span>National Cyber Crime Reporting Portal Contact Directory</span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Official Directory of State Nodal Officers & Cyber Police Units
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Need direct contacts for state grievance officers, cyber police cells, or central nodal authorities across India? Access the official National Cyber Crime contact directory.
          </p>
        </div>

        <a
          href="https://cybercrime.gov.in/contactus"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all group cursor-pointer"
        >
          <span>https://cybercrime.gov.in/contactus</span>
          <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>

      {/* Official Cyber Crime Portal FAQs Link at Bottom of Nearby Help Page */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-wide">
            <ExternalLink className="w-4 h-4" />
            <span>National Cyber Crime Reporting Portal FAQs</span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions & Citizen Filing Guidelines
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Have questions regarding reporting complaints, tracking police investigation numbers, evidence requirements, or jurisdictional cells? Read the official portal FAQ.
          </p>
        </div>

        <a
          href="https://cybercrime.gov.in/faq"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-5 py-3 bg-teal-600 hover:bg-teal-500 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all group cursor-pointer"
        >
          <span>https://cybercrime.gov.in/faq</span>
          <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
};
