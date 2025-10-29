import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Thermometer, Zap, Clock, TrendingUp } from 'lucide-react';
import yaml from 'js-yaml';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WeatherDataPoint {
  time: string;
  value: number | string;
}

interface WeatherSection {
  unit: string;
  values: WeatherDataPoint[];
}

interface YamlData {
  temperature: WeatherSection;
  power: WeatherSection;
}

interface ProcessedWeatherData {
  timestamp: string;
  temperatura: number;
  energia: number;
}

const WeatherDashboard: React.FC = () => {
  const [data, setData] = useState<ProcessedWeatherData[]>([]);
  const [currentData, setCurrentData] = useState<ProcessedWeatherData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función para convertir deciKelvins a Celsius
  const deciKelvinToCelsius = (dK: number): number => {
    return Math.round(((dK / 10) - 273.15) * 10) / 10;
  };

  // Función para procesar datos YAML al formato esperado
  const processYamlData = (yamlData: YamlData): ProcessedWeatherData[] => {
    const temperatureData = yamlData.temperature.values;
    const powerData = yamlData.power.values;
    
    // Crear un mapa para unir datos por tiempo
    const dataMap = new Map<string, ProcessedWeatherData>();
    
    // Procesar temperaturas
    temperatureData.forEach(tempPoint => {
      const tempValue = typeof tempPoint.value === 'string' ? 
        parseFloat(tempPoint.value) : tempPoint.value;
      dataMap.set(tempPoint.time, {
        timestamp: `2025-10-28T${tempPoint.time}Z`,
        temperatura: deciKelvinToCelsius(tempValue),
        energia: 0 // Se llenará después
      });
    });
    
    // Procesar energía/potencia
    powerData.forEach(powerPoint => {
      const powerValue = typeof powerPoint.value === 'string' ? 
        parseFloat(powerPoint.value) : powerPoint.value;
      const existing = dataMap.get(powerPoint.time);
      if (existing) {
        existing.energia = powerValue;
      }
    });
    
    return Array.from(dataMap.values()).slice(0, 100); // Limitar para rendimiento
  };

  // Función para cargar datos YAML
  const loadYamlData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/data.yml');
      
      if (!response.ok) {
        throw new Error(`Error al cargar datos: ${response.status}`);
      }
      
      const yamlText = await response.text();
      const parsedData = yaml.load(yamlText) as YamlData;
      
      if (parsedData && parsedData.temperature && parsedData.power) {
        const processedData = processYamlData(parsedData);
        setData(processedData);
        setError(null);
      } else {
        throw new Error('Formato de datos YAML inválido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error cargando datos YAML:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para obtener el punto de datos actual basado en la hora
  const getCurrentPoint = useCallback(() => {
    if (data.length === 0) return;

    const now = new Date();
    const seconds = now.getSeconds();
    const intervalIndex = Math.floor(seconds / 5); // Cada 5 segundos
    
    if (intervalIndex < data.length) {
      setCurrentData(data[intervalIndex]);
      setLastUpdate(new Date());
    }
  }, [data]);

  // Cargar datos inicial
  useEffect(() => {
    loadYamlData();
  }, [loadYamlData]);

  // Actualizar datos cada 5 segundos
  useEffect(() => {
    if (data.length === 0) return;

    getCurrentPoint(); // Obtener punto inicial
    
    const interval = setInterval(() => {
      getCurrentPoint();
    }, 5000); // Cada 5 segundos

    return () => clearInterval(interval);
  }, [data, getCurrentPoint]);

  // Configuración del gráfico
  const chartData = {
    labels: data.map(point => {
      const date = new Date(point.timestamp);
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    }),
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: data.map(point => point.temperatura),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        yAxisID: 'y',
        tension: 0.4,
      },
      {
        label: 'Energía (kWh)',
        data: data.map(point => point.energia),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        yAxisID: 'y1',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Datos Meteorológicos en Tiempo Real',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Tiempo',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Temperatura (°C)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Energía (kWh)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando datos meteorológicos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <div className="text-red-600 mb-4">
            <TrendingUp size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Error al cargar datos</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadYamlData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard Meteorológico METEOROLOGICA
          </h1>
          <p className="text-gray-600">
            Visualización en tiempo real de datos meteorológicos
          </p>
        </header>

        {/* Última actualización */}
        {lastUpdate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center text-blue-800">
              <Clock size={20} className="mr-2" />
              <span className="font-medium">
                Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
              </span>
            </div>
          </div>
        )}

        {/* Valores actuales */}
        {currentData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Temperatura Actual
                  </h3>
                  <p className="text-3xl font-bold text-red-600">
                    {currentData.temperatura}°C
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(currentData.timestamp).toLocaleTimeString('es-ES')}
                  </p>
                </div>
                <Thermometer size={48} className="text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Energía Producida
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {currentData.energia} kWh
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(currentData.timestamp).toLocaleTimeString('es-ES')}
                  </p>
                </div>
                <Zap size={48} className="text-green-500" />
              </div>
            </div>
          </div>
        )}

        {/* Gráfico */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Estadísticas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              Temperatura Promedio
            </h4>
            <p className="text-2xl font-bold text-blue-600">
              {data.length > 0 
                ? (data.reduce((sum, point) => sum + point.temperatura, 0) / data.length).toFixed(1)
                : '0'}°C
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              Energía Total
            </h4>
            <p className="text-2xl font-bold text-green-600">
              {data.length > 0 
                ? data.reduce((sum, point) => sum + point.energia, 0).toFixed(1)
                : '0'} kWh
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              Puntos de Datos
            </h4>
            <p className="text-2xl font-bold text-purple-600">
              {data.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;