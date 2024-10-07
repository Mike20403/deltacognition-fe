import React from 'react';

const Notifications = ({ alerts }) => {
  return (
    <div className="notifications">
      {alerts.length > 0 ? (
        alerts.map((alert, index) => (
          <p key={index} style={{ color: 'red' }}>
            {alert}
          </p>
        ))
      ) : (
        <p>No alerts.</p>
      )}
    </div>
  );
};

export default Notifications;
