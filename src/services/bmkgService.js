import client from '../lib/apiClient';

const BMKG_BASE = import.meta.env.VITE_BMKG_BASE || 'https://data.bmkg.go.id';
const BMKG_WEATHER_BASE = import.meta.env.VITE_BMKG_WEATHER_BASE || 'https://api.bmkg.go.id';

function normalizeEarthquake(g) {
  return {
    tanggal: g.Tanggal || '',
    jam: g.Jam || '',
    dateTime: g.DateTime || null,
    coordinates: g.Coordinates || '',
    lintang: g.Lintang || '',
    bujur: g.Bujur || '',
    magnitude: g.Magnitude ? parseFloat(g.Magnitude) : 0,
    kedalaman: g.Kedalaman || '',
    wilayah: g.Wilayah || '',
    potensi: g.Potensi || '',
    dirasakan: g.Dirasakan || '',
    shakemap: g.Shakemap || '',
  };
}

export async function getLatestEarthquake() {
  const response = await client.get(`${BMKG_BASE}/DataMKG/TEWS/autogempa.json`);
  const gempa = response.data?.Infogempa?.gempa;
  if (!gempa) throw new Error('Format respons BMKG tidak dikenali');
  return normalizeEarthquake(gempa);
}

export async function getRecentEarthquakes() {
  const response = await client.get(`${BMKG_BASE}/DataMKG/TEWS/gempaterkini.json`);
  const gempa = response.data?.Infogempa?.gempa;
  if (!gempa) throw new Error('Format respons BMKG tidak dikenali');
  const list = Array.isArray(gempa) ? gempa : [gempa];
  return list.map(normalizeEarthquake);
}

export async function getFeltEarthquakes() {
  const response = await client.get(`${BMKG_BASE}/DataMKG/TEWS/gempadirasakan.json`);
  const gempa = response.data?.Infogempa?.gempa;
  if (!gempa) throw new Error('Format respons BMKG tidak dikenali');
  const list = Array.isArray(gempa) ? gempa : [gempa];
  return list.map(normalizeEarthquake);
}

// Koordinat ibu kota / kota utama tiap provinsi untuk Open-Meteo
const PROVINCE_COORDS = {
  '11': { lat: 5.548, lon: 95.323, name: 'Banda Aceh' },
  '12': { lat: 3.595, lon: 98.672, name: 'Medan, Sumatera Utara' },
  '13': { lat: -0.940, lon: 100.374, name: 'Padang, Sumatera Barat' },
  '14': { lat: 0.507, lon: 101.448, name: 'Pekanbaru, Riau' },
  '15': { lat: -1.611, lon: 103.615, name: 'Jambi' },
  '16': { lat: -2.976, lon: 104.775, name: 'Palembang, Sumatera Selatan' },
  '17': { lat: -3.801, lon: 102.266, name: 'Bengkulu' },
  '18': { lat: -5.451, lon: 105.268, name: 'Bandar Lampung' },
  '19': { lat: -2.133, lon: 106.117, name: 'Pangkalpinang, Babel' },
  '21': { lat: 0.917, lon: 104.457, name: 'Tanjungpinang, Kep. Riau' },
  '31': { lat: -6.209, lon: 106.846, name: 'Jakarta' },
  '32': { lat: -6.918, lon: 107.619, name: 'Bandung, Jawa Barat' },
  '33': { lat: -6.993, lon: 110.421, name: 'Semarang, Jawa Tengah' },
  '34': { lat: -7.796, lon: 110.370, name: 'Yogyakarta' },
  '35': { lat: -7.250, lon: 112.750, name: 'Surabaya, Jawa Timur' },
  '36': { lat: -6.120, lon: 106.150, name: 'Serang, Banten' },
  '51': { lat: -8.650, lon: 115.217, name: 'Denpasar, Bali' },
  '52': { lat: -8.583, lon: 116.117, name: 'Mataram, NTB' },
  '53': { lat: -10.183, lon: 123.583, name: 'Kupang, NTT' },
  '61': { lat: -0.023, lon: 109.327, name: 'Pontianak, Kalimantan Barat' },
  '62': { lat: -2.208, lon: 113.916, name: 'Palangkaraya, Kalteng' },
  '63': { lat: -3.323, lon: 114.591, name: 'Banjarmasin, Kalsel' },
  '64': { lat: -0.503, lon: 117.153, name: 'Samarinda, Kaltim' },
  '65': { lat: 2.839, lon: 117.136, name: 'Tanjung Selor, Kaltara' },
  '71': { lat: 1.480, lon: 124.842, name: 'Manado, Sulawesi Utara' },
  '72': { lat: -0.900, lon: 119.878, name: 'Palu, Sulawesi Tengah' },
  '73': { lat: -5.147, lon: 119.432, name: 'Makassar, Sulawesi Selatan' },
  '74': { lat: -3.972, lon: 122.515, name: 'Kendari, Sulawesi Tenggara' },
  '75': { lat: 0.544, lon: 123.062, name: 'Gorontalo' },
  '76': { lat: -2.537, lon: 119.020, name: 'Mamuju, Sulawesi Barat' },
  '81': { lat: -3.656, lon: 128.191, name: 'Ambon, Maluku' },
  '82': { lat: 0.787, lon: 127.375, name: 'Sofifi, Maluku Utara' },
  '91': { lat: -0.861, lon: 134.062, name: 'Manokwari, Papua Barat' },
  '94': { lat: -2.537, lon: 140.718, name: 'Jayapura, Papua' },
};

export async function getWeatherForecast(provinceCode = '31') {
  const coords = PROVINCE_COORDS[provinceCode] || PROVINCE_COORDS['31'];
  const params = new URLSearchParams({
    latitude: coords.lat,
    longitude: coords.lon,
    hourly: 'temperature_2m,relativehumidity_2m,weathercode,windspeed_10m,winddirection_10m,visibility',
    timezone: 'Asia/Jakarta',
    forecast_days: 3,
  });
  const response = await client.get(`https://api.open-meteo.com/v1/forecast?${params}`);
  return { ...response.data, _locationName: coords.name };
}

export const PROVINCE_OPTIONS = [
  { value: '11', label: 'Aceh' },
  { value: '12', label: 'Sumatera Utara' },
  { value: '13', label: 'Sumatera Barat' },
  { value: '14', label: 'Riau' },
  { value: '15', label: 'Jambi' },
  { value: '16', label: 'Sumatera Selatan' },
  { value: '17', label: 'Bengkulu' },
  { value: '18', label: 'Lampung' },
  { value: '19', label: 'Kep. Bangka Belitung' },
  { value: '21', label: 'Kep. Riau' },
  { value: '31', label: 'DKI Jakarta' },
  { value: '32', label: 'Jawa Barat' },
  { value: '33', label: 'Jawa Tengah' },
  { value: '34', label: 'DI Yogyakarta' },
  { value: '35', label: 'Jawa Timur' },
  { value: '36', label: 'Banten' },
  { value: '51', label: 'Bali' },
  { value: '52', label: 'Nusa Tenggara Barat' },
  { value: '53', label: 'Nusa Tenggara Timur' },
  { value: '61', label: 'Kalimantan Barat' },
  { value: '62', label: 'Kalimantan Tengah' },
  { value: '63', label: 'Kalimantan Selatan' },
  { value: '64', label: 'Kalimantan Timur' },
  { value: '65', label: 'Kalimantan Utara' },
  { value: '71', label: 'Sulawesi Utara' },
  { value: '72', label: 'Sulawesi Tengah' },
  { value: '73', label: 'Sulawesi Selatan' },
  { value: '74', label: 'Sulawesi Tenggara' },
  { value: '75', label: 'Gorontalo' },
  { value: '76', label: 'Sulawesi Barat' },
  { value: '81', label: 'Maluku' },
  { value: '82', label: 'Maluku Utara' },
  { value: '91', label: 'Papua Barat' },
  { value: '94', label: 'Papua' },
];
