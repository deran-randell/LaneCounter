import './App.css';
import SideBar from './components/SideBar.js'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Config from './pages/Config'
import LaneDetail from './components/LaneDetail'

function App() {
  return (
    <div className="App">
      <BrowserRouter>

      <div className="side-column">
        <SideBar />
      </div>

      <div className="content">
        <Routes>
          <Route path ="/" element={<Home />}/>       
          <Route path ="dashboard" element={<Dashboard />}/>       
          <Route path ="laneDetail/:id" element={<LaneDetail />}/>
          <Route path ="config" element={<Config />}/>          
        </Routes>
      </div>

      </BrowserRouter>   
    </div>
  );
}

export default App;
