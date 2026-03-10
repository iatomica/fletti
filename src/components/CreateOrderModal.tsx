import React, { useState, useEffect, useRef } from 'react';
import { X, Package, Box, Truck, MapPin, Calendar, DollarSign, Shield, CreditCard, CheckCircle, ChevronRight, ChevronLeft, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Component to handle map clicks
const LocationSelector = ({ onLocationSelect }: { onLocationSelect: (latlng: L.LatLng) => void }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

// Component to update map view based on markers
const MapUpdater = ({ origin, dest, route }: { origin: L.LatLng | null, dest: L.LatLng | null, route: L.LatLngExpression[] | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (route && route.length > 0) {
      const bounds = L.latLngBounds(route as L.LatLngTuple[]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (origin && dest) {
      const bounds = L.latLngBounds(origin, dest);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (origin) {
      map.flyTo(origin, 14);
    } else if (dest) {
      map.flyTo(dest, 14);
    }
  }, [origin, dest, route, map]);

  return null;
};

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: any) => void;
}

type OrderType = 'Muebles' | 'Materiales' | 'Paquetería' | 'Otros';

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  
  // Phase 1: Type
  const [orderType, setOrderType] = useState<OrderType | ''>('');
  
  // Phase 2: Location, Date, Details
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState<L.LatLng | null>(null);
  const [destCoords, setDestCoords] = useState<L.LatLng | null>(null);
  const [routeCoords, setRouteCoords] = useState<L.LatLngExpression[] | null>(null);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [activeInput, setActiveInput] = useState<'origin' | 'destination'>('origin');
  
  // Autocomplete state
  const [originResults, setOriginResults] = useState<SearchResult[]>([]);
  const [destResults, setDestResults] = useState<SearchResult[]>([]);
  const [showOriginResults, setShowOriginResults] = useState(false);
  const [showDestResults, setShowDestResults] = useState(false);
  const originTimeoutRef = useRef<NodeJS.Timeout>();
  const destTimeoutRef = useRef<NodeJS.Timeout>();

  const [cargoType, setCargoType] = useState('');
  const [sizeWeight, setSizeWeight] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [costBreakdown, setCostBreakdown] = useState({ distanceCost: 0, waitCost: 0, serviceFee: 0, distanceKm: 0 });

  // Phase 3: Insurance
  const [declaredValue, setDeclaredValue] = useState('');
  const [insuredGoodsDescription, setInsuredGoodsDescription] = useState('');

  // Phase 4: Payment
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Phase 5: Confirmation
  const [trackingCode, setTrackingCode] = useState('');

  // Fetch route when both origin and destination are set
  useEffect(() => {
    const fetchRoute = async () => {
      if (originCoords && destCoords) {
        try {
          const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson`);
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as L.LatLngExpression);
            setRouteCoords(coords);
            setRouteDistance(data.routes[0].distance);
          } else {
            setRouteCoords(null);
            setRouteDistance(null);
          }
        } catch (error) {
          console.error('Error fetching route:', error);
          setRouteCoords(null);
          setRouteDistance(null);
        }
      } else {
        setRouteCoords(null);
        setRouteDistance(null);
      }
    };
    fetchRoute();
  }, [originCoords, destCoords]);

  // Calculate cost when route or sizeWeight changes
  useEffect(() => {
    if (routeDistance !== null) {
      const distanceKm = routeDistance / 1000;
      const pricePerKm = 2000;
      const distanceCost = distanceKm * pricePerKm;
      
      let estimatedWaitMinutes = 15; // default
      if (sizeWeight === 'small') estimatedWaitMinutes = 10;
      if (sizeWeight === 'medium') estimatedWaitMinutes = 20;
      if (sizeWeight === 'large') estimatedWaitMinutes = 40;
      
      const waitCostPerMinute = 500;
      const waitCost = estimatedWaitMinutes * waitCostPerMinute;
      
      const serviceFee = 1500;
      
      const totalCost = distanceCost + waitCost + serviceFee;
      setEstimatedCost(Math.round(totalCost));
      setCostBreakdown({
        distanceCost: Math.round(distanceCost),
        waitCost: Math.round(waitCost),
        serviceFee,
        distanceKm: parseFloat(distanceKm.toFixed(1))
      });
    } else {
      setEstimatedCost(0);
      setCostBreakdown({ distanceCost: 0, waitCost: 0, serviceFee: 0, distanceKm: 0 });
    }
  }, [routeDistance, sizeWeight]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 2) {
      // Simulate cost calculation
      setEstimatedCost(Math.floor(Math.random() * 20000) + 5000);
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleConfirm = () => {
    const finalOrder = {
      orderType,
      origin,
      destination,
      cargoType,
      sizeWeight,
      dateTime,
      notes,
      declaredValue: declaredValue ? parseFloat(declaredValue) : undefined,
      insuredGoodsDescription,
      estimatedCost,
    };
    
    // Generate a mock tracking code for the UI before submitting
    const mockTracking = `TRK-${Math.floor(Math.random() * 10000)}-${Date.now().toString().slice(-4)}`;
    setTrackingCode(mockTracking);
    
    onSubmit(finalOrder);
    setStep(5); // Move to success phase
  };

  const resetAndClose = () => {
    setStep(1);
    setOrderType('');
    setOrigin('');
    setDestination('');
    setOriginCoords(null);
    setDestCoords(null);
    setActiveInput('origin');
    setCargoType('');
    setSizeWeight('');
    setDateTime('');
    setNotes('');
    setDeclaredValue('');
    setInsuredGoodsDescription('');
    setCardNumber('');
    setCardName('');
    setCardExpiry('');
    setCardCvc('');
    setTrackingCode('');
    onClose();
  };

  const handleMapClick = (latlng: L.LatLng) => {
    if (activeInput === 'origin') {
      setOriginCoords(latlng);
      setOrigin(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
      setActiveInput('destination'); // Auto-switch to destination
    } else {
      setDestCoords(latlng);
      setDestination(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
    }
  };

  const searchAddress = async (query: string, type: 'origin' | 'destination') => {
    if (!query || query.length < 3) {
      if (type === 'origin') setOriginResults([]);
      else setDestResults([]);
      return;
    }

    try {
      // Detect if it's an intersection search (e.g., "salguero y corrientes")
      const intersectionMatch = query.match(/^(.*?)\s+(?:y|and|&|e)\s+(.*?)$/i);
      const isIntersection = !!intersectionMatch;
      
      let formattedResults: SearchResult[] = [];

      const fetchNominatim = async (searchQuery: string) => {
        // Nominatim is better for explicit intersections. We use a strict viewbox for Cordoba Capital.
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&viewbox=-64.3,-31.2,-64.0,-31.5&bounded=1`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.map((item: any) => {
          const parts = item.display_name.split(', ');
          // Clean up the long Nominatim string to keep it readable
          const cleanName = parts.filter((p: string) => !p.includes('Pedanía') && !p.includes('Departamento') && !p.match(/^X\d{4}/) && p !== 'Argentina').slice(0, 3).join(', ');
          return {
            place_id: item.place_id,
            display_name: cleanName,
            lat: item.lat,
            lon: item.lon
          };
        });
      };

      const fetchPhoton = async (searchQuery: string) => {
        // Photon is better for fuzzy matching (typos like "garson")
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=15&lat=-31.4260&lon=-64.1836`);
        if (!response.ok) return [];
        const data = await response.json();
        
        // Strictly filter results to be within Cordoba Capital bounds
        const cordobaResults = data.features.filter((f: any) => {
          const lat = f.geometry.coordinates[1];
          const lon = f.geometry.coordinates[0];
          const inBounds = lat < -31.2 && lat > -31.5 && lon > -64.3 && lon < -64.0;
          return inBounds;
        }).slice(0, 5);

        return cordobaResults.map((f: any, index: number) => {
          const props = f.properties;
          let displayName = props.name || '';
          
          if (props.street && props.street !== props.name) {
            displayName += displayName ? `, ${props.street}` : props.street;
          }
          if (props.housenumber) {
            displayName += ` ${props.housenumber}`;
          }
          if (props.district && !displayName.includes(props.district)) {
            displayName += `, ${props.district}`;
          }
          
          return {
            place_id: props.osm_id || index,
            display_name: displayName || 'Ubicación',
            lat: f.geometry.coordinates[1].toString(),
            lon: f.geometry.coordinates[0].toString(),
          };
        });
      };

      if (isIntersection) {
        const street1 = intersectionMatch[1].trim();
        const street2 = intersectionMatch[2].trim();
        
        // 1. Direct Nominatim attempt with "and" (OSM standard for intersections)
        formattedResults = await fetchNominatim(`${street1} and ${street2}, Córdoba`);
        
        // 2. If failed, try to "resolve" the fuzzy street names using Photon, then try Nominatim again
        if (formattedResults.length === 0) {
          try {
            const getStreet = async (s: string) => {
              const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(s + ' Córdoba')}&limit=3&lat=-31.4260&lon=-64.1836`);
              const d = await res.json();
              const f = d.features.find((feat: any) => {
                const lat = feat.geometry.coordinates[1];
                const lon = feat.geometry.coordinates[0];
                return lat < -31.2 && lat > -31.5 && lon > -64.3 && lon < -64.0;
              });
              return f ? (f.properties.name || f.properties.street) : null;
            };
            
            const [resolvedStreet1, resolvedStreet2] = await Promise.all([
              getStreet(street1),
              getStreet(street2)
            ]);
            
            if (resolvedStreet1 && resolvedStreet2) {
              formattedResults = await fetchNominatim(`${resolvedStreet1} and ${resolvedStreet2}, Córdoba`);
            }
          } catch (e) {
            console.error('Error resolving fuzzy streets', e);
          }
        }
        
        // 3. If STILL failed, fallback to a fuzzy Photon search combining both
        if (formattedResults.length === 0) {
          formattedResults = await fetchPhoton(`${street1} ${street2} Córdoba`);
        }
      } else {
        // Not an intersection
        formattedResults = await fetchPhoton(`${query}, Córdoba`);
        if (formattedResults.length === 0) {
          formattedResults = await fetchNominatim(`${query}, Córdoba`);
        }
      }
      
      if (type === 'origin') {
        setOriginResults(formattedResults);
        setShowOriginResults(true);
      } else {
        setDestResults(formattedResults);
        setShowDestResults(true);
      }
    } catch (error) {
      console.error('Error searching address:', error);
    }
  };

  const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOrigin(value);
    
    if (originTimeoutRef.current) clearTimeout(originTimeoutRef.current);
    
    originTimeoutRef.current = setTimeout(() => {
      searchAddress(value, 'origin');
    }, 500);
  };

  const handleDestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);
    
    if (destTimeoutRef.current) clearTimeout(destTimeoutRef.current);
    
    destTimeoutRef.current = setTimeout(() => {
      searchAddress(value, 'destination');
    }, 500);
  };

  const selectOrigin = (result: SearchResult) => {
    setOrigin(result.display_name);
    setOriginCoords(L.latLng(parseFloat(result.lat), parseFloat(result.lon)));
    setShowOriginResults(false);
    setActiveInput('destination');
  };

  const selectDest = (result: SearchResult) => {
    setDestination(result.display_name);
    setDestCoords(L.latLng(parseFloat(result.lat), parseFloat(result.lon)));
    setShowDestResults(false);
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-6">
        {[1, 2, 3, 4, 5].map((s) => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === s ? 'bg-indigo-600 text-white' : 
              step > s ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {step > s ? <CheckCircle className="w-5 h-5" /> : s}
            </div>
            {s < 5 && (
              <div className={`w-10 h-1 mx-1 rounded ${step > s ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true" onClick={step === 5 ? resetAndClose : undefined}>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-[101]">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl leading-6 font-bold text-gray-900">
                {step === 1 && '¿Qué necesitas transportar?'}
                {step === 2 && 'Detalles del viaje'}
                {step === 3 && 'Seguro de carga'}
                {step === 4 && 'Pago'}
                {step === 5 && '¡Pedido Confirmado!'}
              </h3>
              {step !== 5 && (
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              )}
            </div>

            {renderStepIndicator()}

            <div className="mt-4 min-h-[300px]">
              {/* Phase 1: Type */}
              {step === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'Muebles', icon: Box, label: 'Muebles / Mudanza' },
                    { id: 'Materiales', icon: Truck, label: 'Materiales de Construcción' },
                    { id: 'Paquetería', icon: Package, label: 'Paquetería / Cajas' },
                    { id: 'Otros', icon: MapPin, label: 'Otros' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setOrderType(type.id as OrderType)}
                      className={`p-6 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                        orderType === type.id 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <type.icon className={`w-12 h-12 mb-3 ${orderType === type.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className="font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Phase 2: Details & Map */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border border-gray-200 relative overflow-hidden z-0">
                    <MapContainer center={[-31.4260, -64.1836]} zoom={14} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                      />
                      <LocationSelector onLocationSelect={handleMapClick} />
                      <MapUpdater origin={originCoords} dest={destCoords} route={routeCoords} />
                      {originCoords && (
                        <Marker position={originCoords}>
                          <Popup>Origen</Popup>
                        </Marker>
                      )}
                      {destCoords && (
                        <Marker position={destCoords}>
                          <Popup>Destino</Popup>
                        </Marker>
                      )}
                      {routeCoords ? (
                        <Polyline positions={routeCoords} color="#4f46e5" weight={5} opacity={0.8} />
                      ) : originCoords && destCoords ? (
                        <Polyline positions={[originCoords, destCoords]} color="#4f46e5" weight={4} dashArray="10, 10" />
                      ) : null}
                    </MapContainer>
                    <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-md shadow-md text-xs font-medium z-[400]">
                      Haz clic en el mapa para seleccionar: <span className="text-indigo-600 font-bold">{activeInput === 'origin' ? 'Origen' : 'Destino'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700">Origen</label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input 
                          type="text" 
                          value={origin} 
                          onChange={handleOriginChange} 
                          onFocus={() => { setActiveInput('origin'); setShowOriginResults(true); }}
                          onBlur={() => setTimeout(() => setShowOriginResults(false), 200)}
                          className={`block w-full pl-10 border ${activeInput === 'origin' ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} 
                          placeholder="Buscar dirección en Córdoba..." 
                        />
                      </div>
                      {showOriginResults && originResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                          {originResults.map((result) => (
                            <div 
                              key={result.place_id} 
                              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 hover:text-indigo-900 text-gray-900"
                              onClick={() => selectOrigin(result)}
                            >
                              <span className="block truncate">{result.display_name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700">Destino</label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input 
                          type="text" 
                          value={destination} 
                          onChange={handleDestChange} 
                          onFocus={() => { setActiveInput('destination'); setShowDestResults(true); }}
                          onBlur={() => setTimeout(() => setShowDestResults(false), 200)}
                          className={`block w-full pl-10 border ${activeInput === 'destination' ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} 
                          placeholder="Buscar dirección en Córdoba..." 
                        />
                      </div>
                      {showDestResults && destResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                          {destResults.map((result) => (
                            <div 
                              key={result.place_id} 
                              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 hover:text-indigo-900 text-gray-900"
                              onClick={() => selectDest(result)}
                            >
                              <span className="block truncate">{result.display_name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de Carga</label>
                      <input type="text" value={cargoType} onChange={(e) => setCargoType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Ej: Muebles de oficina" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tamaño/Peso</label>
                      <input type="text" value={sizeWeight} onChange={(e) => setSizeWeight(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Ej: 500kg, 2m3" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                      <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                      <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Instrucciones adicionales..." />
                    </div>
                  </div>
                </div>
              )}

              {/* Phase 3: Insurance */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                    <Shield className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Seguro de Carga Opcional</h4>
                      <p className="text-sm text-blue-700 mt-1">Declara el valor de tus bienes para asegurarlos durante el viaje. El costo del seguro se calculará sobre este valor.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valor Declarado ($)</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input type="number" value={declaredValue} onChange={(e) => setDeclaredValue(e.target.value)} className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2" placeholder="0.00" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción de los bienes a asegurar</label>
                    <textarea rows={3} value={insuredGoodsDescription} onChange={(e) => setInsuredGoodsDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Describe detalladamente los objetos de valor..." />
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Costo estimado del viaje:</span>
                      <span className="font-medium text-gray-900">${estimatedCost.toLocaleString()}</span>
                    </div>
                    {declaredValue && (
                      <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-gray-600">Costo del seguro (1%):</span>
                        <span className="font-medium text-gray-900">${(parseFloat(declaredValue) * 0.01).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-base font-bold mt-4 pt-4 border-t border-gray-200">
                      <span className="text-gray-900">Total Estimado:</span>
                      <span className="text-indigo-600">${(estimatedCost + (declaredValue ? parseFloat(declaredValue) * 0.01 : 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Phase 4: Payment */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">Resumen de Costos</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Distancia ({costBreakdown.distanceKm} km x $2000)</span>
                        <span className="font-medium">${costBreakdown.distanceCost.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tiempo de carga/espera estimado</span>
                        <span className="font-medium">${costBreakdown.waitCost.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tasa de servicio</span>
                        <span className="font-medium">${costBreakdown.serviceFee.toLocaleString('es-AR')}</span>
                      </div>
                      {declaredValue && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Seguro de Carga (1%)</span>
                          <span className="font-medium">${(parseFloat(declaredValue) * 0.01).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold mt-3 pt-3 border-t border-gray-200">
                      <span className="text-gray-900">Total a Pagar:</span>
                      <span className="text-indigo-600">${(estimatedCost + (declaredValue ? parseFloat(declaredValue) * 0.01 : 0)).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Número de Tarjeta</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CreditCard className="h-5 w-5 text-gray-400" />
                        </div>
                        <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2" placeholder="0000 0000 0000 0000" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre en la Tarjeta</label>
                      <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="JUAN PEREZ" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Vencimiento</label>
                        <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="MM/YY" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">CVC</label>
                        <input type="text" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="123" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Phase 5: Success */}
              {step === 5 && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">¡Pedido Confirmado!</h2>
                  <p className="text-gray-500 text-center max-w-sm">
                    Tu pedido ha sido publicado y los transportistas cercanos ya han sido notificados.
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-full max-w-sm mt-6">
                    <p className="text-sm text-gray-500 text-center mb-1">Código de Seguimiento</p>
                    <p className="text-xl font-mono font-bold text-center text-indigo-600 tracking-wider">{trackingCode}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer Actions */}
          {step < 5 && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
              {step < 4 ? (
                <button
                  type="button"
                  disabled={
                    (step === 1 && !orderType) || 
                    (step === 2 && (!origin || !destination || !dateTime))
                  }
                  onClick={handleNext}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente <ChevronRight className="w-4 h-4 ml-1 mt-0.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Confirmar y Pagar
                </button>
              )}
              
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-1 mt-0.5" /> Atrás
                </button>
              )}
              
              {step === 1 && (
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              )}
            </div>
          )}
          
          {step === 5 && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
              <button
                type="button"
                onClick={resetAndClose}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Volver a mis pedidos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
