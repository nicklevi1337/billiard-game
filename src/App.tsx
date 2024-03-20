import React from 'react';
import Canvas from './components/Canvas';
import './App.css';

function App() {
  return (
    <div className="App">
     <header className="App-header">
        <h1>Billiard Game</h1>
      </header>
      <main className='billiard'>
        <Canvas width={800} height={500}/>
      </main>
    </div>
  );
}

export default App;
