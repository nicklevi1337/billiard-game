import React from 'react';
import BilliardsGame from './components/BilliardsGame';

const App: React.FC = () => {
  return (
    <div className="App">
      <div style={{ textAlign: 'center' }}>
        <h1>Billiards Game</h1>
        <BilliardsGame />
      </div>
    </div>
  );
};

export default App;
