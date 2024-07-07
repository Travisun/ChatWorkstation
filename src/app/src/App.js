import './App.css';
import BootloaderComponent from "./components/Bootloader";
import HeaderBar from "./components/HeaderBar";

function App() {
  return (
    <div className="App">
        <HeaderBar />
        <BootloaderComponent />
    </div>
  );
}

export default App;
