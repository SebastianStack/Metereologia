// Simulador de datos meteorológicos para la prueba técnica
export interface WeatherData {
  timestamp: string;
  temperatura: number;
  energia: number;
}

// Datos de ejemplo que simulan lecturas cada 5 segundos
export const generateWeatherData = (): WeatherData[] => {
  const data: WeatherData[] = [];
  const startTime = new Date('2025-10-28T09:00:00Z');
  
  for (let i = 0; i < 120; i++) { // 10 minutos de datos (120 puntos cada 5 segundos)
    const timestamp = new Date(startTime.getTime() + i * 5000);
    const temperatura = 18 + Math.sin(i * 0.1) * 3 + Math.random() * 2;
    const energia = 200 + i * 2 + Math.sin(i * 0.05) * 50 + Math.random() * 20;
    
    data.push({
      timestamp: timestamp.toISOString(),
      temperatura: Math.round(temperatura * 10) / 10,
      energia: Math.round(energia * 10) / 10
    });
  }
  
  return data;
};

// Función para obtener el siguiente punto de datos basado en la hora actual
export const getCurrentDataPoint = (allData: WeatherData[]): WeatherData | null => {
  const now = new Date();
  const startTime = new Date('2025-10-28T09:00:00Z');
  const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 5000); // Cada 5 segundos
  
  if (elapsed >= 0 && elapsed < allData.length) {
    return allData[elapsed];
  }
  
  return null;
};