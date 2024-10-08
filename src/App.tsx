import { Dashboard } from '@/src/pages/Dashboard.tsx';
import './index.css';
import Pipeline from './components/Pipeline';
import { useEffect, useRef, useState } from 'react';
import { WebsocketClient } from './utils/websocket';
import Notifications from './components/Notification';

function App() {
  const [deviceData, setDeviceData] = useState(null);
  const [alerts, setAlerts] = useState<any>([]);
  const webSocketClient = useRef<WebsocketClient | null>(null);

  useEffect(() => {
    webSocketClient.current = new WebsocketClient(import.meta.env.VITE_WS_URL as string);

    webSocketClient.current.connect();

    webSocketClient.current.onMessage((data: any) => {
      if (data.status == 'inactive') {
        setAlerts((prev) => [...prev, `Device ${data.deviceId} is down!`]);
      } else if (data.type == 'NODE_CREATED') {
        setDeviceData(data.node.deviceId);
      } else {
        setDeviceData(data);
      }
    });

    return () => {
      webSocketClient.current?.close();
      webSocketClient.current = null;
    };
  }, []);

  return (
    <>
      <div className="App">
        <div className="bg-white w-[100vw] min-h-[100vh]">
          <div className="w-full h-full p-10 min-h-[100vh]">
            <h1 className="text-4xl font-bold">Data Pipeline Application</h1>

            <div className="p-3 bg-[#f0f0f0] rounded-2xl mt-3">
              <h2 className="text-3xl font-bold">Pipeline Builder:</h2>
              <div className="w-full h-full p-3">
                <Pipeline webSocket={webSocketClient} />
              </div>
            </div>

            <div className="p-5 bg-[#f0f0f0] rounded-2xl mt-[2rem]">
              <h2 className="text-3xl font-bold">Dashboard:</h2>
              <Dashboard deviceData={deviceData} />
            </div>

            <h2>Notifications</h2>
            <Notifications alerts={alerts} />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
