import './App.css';
import BootloaderComponent from "./components/Bootloader.mjs";
import HeaderBar from "./components/HeaderBar.mjs";

function App() {
  return (
    <div className="App">
        <HeaderBar />
        <BootloaderComponent
            src={"http://localhost:8080"}
            title="Chat Workstation"
        />
    </div>
  );
}

export default App;
