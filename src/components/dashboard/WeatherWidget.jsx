import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Sun, Cloud, CloudSun, CloudRain, CloudDrizzle, CloudLightning,
  Wind, Droplets, Eye, MapPin, Info, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { getWeatherForecast, PROVINCE_OPTIONS } from '../../services/bmkgService';
import { Dropdown } from '../ui/Dropdown';
import { Tooltip } from '../ui/Tooltip';
import { SkeletonLoader } from '../ui/SkeletonLoader';

const STALE = 3 * 60 * 60 * 1000;

const provinceOptions = PROVINCE_OPTIONS.map((p) => ({ value: p.value, label: p.label }));

function getWeatherIcon(code, size = 24) {
  const n = Number(code);
  if (n === 0) return <Sun size={size} className="text-amber-400" />;
  if (n <= 2) return <CloudSun size={size} className="text-amber-300" />;
  if (n === 3) return <Cloud size={size} className="text-gray-400" />;
  if (n === 45 || n === 48) return <Wind size={size} className="text-gray-400" />;
  if ((n >= 51 && n <= 57) || (n >= 60 && n <= 62)) return <CloudDrizzle size={size} className="text-blue-400" />;
  if (n >= 63 && n < 95) return <CloudRain size={size} className="text-blue-500" />;
  if (n >= 95) return <CloudLightning size={size} className="text-primary" />;
  return <Cloud size={size} className="text-gray-400" />;
}

function getWeatherDesc(code) {
  const n = Number(code);
  if (n === 0) return 'Cerah';
  if (n === 1) return 'Sebagian Cerah';
  if (n === 2) return 'Berawan Sebagian';
  if (n === 3) return 'Mendung';
  if (n === 45 || n === 48) return 'Berkabut';
  if (n === 51) return 'Gerimis Ringan';
  if (n === 53) return 'Gerimis Sedang';
  if (n === 55) return 'Gerimis Lebat';
  if (n === 61) return 'Hujan Ringan';
  if (n === 63) return 'Hujan Sedang';
  if (n === 65) return 'Hujan Lebat';
  if (n >= 71 && n <= 77) return 'Berawan';
  if (n === 80) return 'Hujan Lokal';
  if (n === 81) return 'Hujan Lokal Sedang';
  if (n === 82) return 'Hujan Lokal Lebat';
  if (n === 95) return 'Badai Petir';
  if (n >= 96) return 'Badai Petir Dahsyat';
  return 'Tidak Diketahui';
}

function windDegToDir(deg) {
  if (deg == null) return null;
  const dirs = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'];
  return dirs[Math.round(deg / 45) % 8];
}

function formatVisibility(m) {
  if (m == null) return '—';
  if (m >= 10000) return '>10 km';
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

function parseResponse(raw) {
  if (!raw?.hourly?.time?.length) return null;

  const { time, temperature_2m, relativehumidity_2m, weathercode, windspeed_10m, winddirection_10m, visibility } = raw.hourly;

  const now = new Date();
  const forecasts = time.map((t, i) => ({
    datetime: new Date(t),
    temp: temperature_2m?.[i] != null ? Math.round(temperature_2m[i]) : null,
    humidity: relativehumidity_2m?.[i] != null ? Math.round(relativehumidity_2m[i]) : null,
    windSpeed: windspeed_10m?.[i] != null ? Math.round(windspeed_10m[i]) : null,
    windDir: windDegToDir(winddirection_10m?.[i]),
    weatherCode: weathercode?.[i] ?? 0,
    weatherDesc: getWeatherDesc(weathercode?.[i] ?? 0),
    visibility: formatVisibility(visibility?.[i]),
  }));

  const current = forecasts.find((f) => f.datetime >= now) ?? forecasts[forecasts.length - 1];
  const upcoming = forecasts.filter((f) => f.datetime > (current?.datetime ?? now)).slice(0, 4);

  return {
    locationName: raw._locationName || '',
    current,
    upcoming,
  };
}

export function WeatherWidget() {
  const [province, setProvince] = useState('31');

  const { data: raw, isLoading, isError, refetch } = useQuery({
    queryKey: ['openmeteo', 'weather', province],
    queryFn: () => getWeatherForecast(province),
    staleTime: STALE,
    retry: 2,
  });

  const weather = raw ? parseResponse(raw) : null;
  const provinceName = PROVINCE_OPTIONS.find((p) => p.value === province)?.label || province;

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <CloudSun size={15} className="text-supporting" />
          <h3 className="font-semibold text-text-primary text-sm">Prakiraan Cuaca</h3>
          <Tooltip content="Sumber: api.open-meteo.com — data cuaca gratis, tanpa kunci API, cakupan seluruh Indonesia" side="right">
            <Info size={12} className="text-text-secondary cursor-help" />
          </Tooltip>
        </div>

        <Dropdown
          options={provinceOptions}
          value={province}
          onChange={setProvince}
          align="right"
        />
      </div>

      {isLoading && <WeatherSkeleton />}

      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center px-6">
          <AlertTriangle size={24} className="text-warning" />
          <div>
            <p className="text-sm font-medium text-text-primary">Gagal memuat prakiraan cuaca</p>
            <p className="text-xs text-text-secondary mt-1 max-w-xs">
              Gagal menghubungi Open-Meteo. Periksa koneksi internet dan coba lagi.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <RefreshCw size={12} /> Muat ulang
          </button>
        </div>
      )}

      {!isLoading && !isError && !weather && (
        <div className="py-10 text-center px-6">
          <p className="text-sm text-text-secondary">
            Data prakiraan cuaca tidak tersedia untuk <strong>{provinceName}</strong>.
          </p>
          <p className="text-xs text-text-secondary mt-1">Coba muat ulang halaman.</p>
        </div>
      )}

      {weather && (
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex items-center gap-5 flex-1 min-w-0">
              <div className="shrink-0">{getWeatherIcon(weather.current?.weatherCode, 52)}</div>
              <div className="min-w-0">
                <p className="font-mono font-bold text-4xl text-text-primary leading-none">
                  {weather.current?.temp != null ? `${weather.current.temp}°C` : '—'}
                </p>
                <p className="text-sm font-medium text-text-secondary mt-1">
                  {weather.current?.weatherDesc || '—'}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-text-secondary">
                  <MapPin size={11} className="shrink-0" />
                  <span className="truncate">{weather.locationName}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:w-52 shrink-0">
              <StatPill
                icon={Droplets}
                label="Kelembapan"
                value={weather.current?.humidity != null ? `${weather.current.humidity}%` : '—'}
              />
              <StatPill
                icon={Wind}
                label="Angin"
                value={weather.current?.windSpeed != null ? `${weather.current.windSpeed} km/j` : '—'}
                sub={weather.current?.windDir}
              />
              <StatPill
                icon={Eye}
                label="Jarak Pandang"
                value={weather.current?.visibility || '—'}
              />
            </div>
          </div>

          {weather.upcoming.length > 0 && (
            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
                Prakiraan berikutnya
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {weather.upcoming.map((f, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-bg border border-border/60 text-center"
                  >
                    <p className="text-[11px] font-mono text-text-secondary">
                      {f.datetime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {getWeatherIcon(f.weatherCode, 18)}
                    <p className="font-mono font-semibold text-sm text-text-primary">
                      {f.temp != null ? `${f.temp}°C` : '—'}
                    </p>
                    <p className="text-[10px] text-text-secondary leading-tight line-clamp-2">
                      {f.weatherDesc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-[11px] text-text-secondary">
            Sumber: Open-Meteo ·{' '}
            {weather.current?.datetime
              ? `data per ${weather.current.datetime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
              : 'diperbarui berkala'}
          </p>
        </div>
      )}
    </div>
  );
}

function StatPill({ icon: Icon, label, value, sub }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-bg border border-border/60 text-center">
      <Icon size={14} className="text-text-secondary" />
      <p className="font-mono font-semibold text-sm text-text-primary leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-text-secondary">{sub}</p>}
      <p className="text-[10px] text-text-secondary">{label}</p>
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <div className="p-6 space-y-5">
      <div className="flex gap-5">
        <SkeletonLoader className="w-14 h-14 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <SkeletonLoader className="h-9 w-24" />
          <SkeletonLoader className="h-4 w-40" />
          <SkeletonLoader className="h-3 w-32" />
        </div>
        <div className="grid grid-cols-3 gap-2 w-52 shrink-0">
          {[0, 1, 2].map((i) => <SkeletonLoader key={i} className="h-16 rounded-lg" />)}
        </div>
      </div>
      <div className="pt-4 border-t border-border grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => <SkeletonLoader key={i} className="h-20 rounded-lg" />)}
      </div>
    </div>
  );
}
