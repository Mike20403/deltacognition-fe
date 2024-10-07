import { useEffect, useState } from 'react';
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
import { WebsocketClient } from '../utils/websocket';

// Register the necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export interface DashboardProps {
  deviceData: any;
}

// Function to generate distinct HSL colors
const generateColor = (index: number) => {
  const hue = (index * 137.508) % 360; // Using the golden ratio for better color distribution
  return `hsl(${hue}, 70%, 50%)`; // Saturation: 70%, Lightness: 50%
};

export const Dashboard = (props: DashboardProps) => {
  const { deviceData } = props;

  // State to hold data for all devices
  const [deviceCharts, setDeviceCharts] = useState<{ [key: string]: any }>({});
  const [selectedDevice, setSelectedDevice] = useState<string>(''); // Default to "deviceA"
  const [deviceColors, setDeviceColors] = useState<{ [key: string]: string }>({}); // Store generated colors for devices

  useEffect(() => {
    if (deviceData) {
      const { _id: deviceId, lastSeen: timestamp, lastValue: value } = deviceData;
      if (!selectedDevice) setSelectedDevice(deviceId);
      setDeviceCharts((prevState) => {
        const currentDeviceData = prevState[deviceId] || {
          labels: [],
          datasets: [
            {
              label: deviceId,
              data: [],
              borderColor: deviceColors[deviceId] || generateColor(Object.keys(prevState).length),
              fill: false,
            },
          ],
        };

        // Update the labels and data for this device
        const newLabels = [...currentDeviceData.labels, new Date(timestamp).toLocaleTimeString()];
        const newData = [...currentDeviceData.datasets[0].data, value];

        // Store the device color if it's a new device
        if (!deviceColors[deviceId]) {
          setDeviceColors((prevColors) => ({
            ...prevColors,
            [deviceId]: generateColor(Object.keys(prevState).length),
          }));
        }

        return {
          ...prevState,
          [deviceId]: {
            labels: newLabels.slice(-15), // Keep the last 15 labels
            datasets: [
              {
                ...currentDeviceData.datasets[0],
                data: newData.slice(-15), // Keep the last 15 data points
              },
            ],
          },
        };
      });
    }
  }, [deviceData, deviceColors]);

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDevice(e.target.value);
  };

  return (
    <div className="table-container mt-10 w-full bg-white p-5 rounded-2xl">
      <div className="device-selector">
        {/* Select dropdown to switch between devices */}
        <select
          className={`border-[1px] border-black cursor-pointer hover:outline hover:outline-2 active:outline active:outline-2 p-2 rounded-md`}
          style={{
            color: deviceColors[selectedDevice],
          }}
          value={selectedDevice}
          onChange={handleDeviceChange}
        >
          {Object.keys(deviceCharts).map((deviceId) => (
            <option
              style={{
                color: deviceColors[deviceId],
              }}
              key={deviceId}
              value={deviceId}
            >
              {deviceId}
            </option>
          ))}
        </select>
      </div>

      {/* Render chart for the selected device */}
      {deviceCharts[selectedDevice] && <Line data={deviceCharts[selectedDevice]} />}
    </div>
  );
};
