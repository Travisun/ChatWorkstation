import './App.css';
import BootloaderComponent from "./components/Bootloader";
import HeaderBar from "./components/HeaderBar";

function App() {
  return (
    <div className="App">
        <HeaderBar />
        <BootloaderComponent
            src={"http://localhost:8080"}
            title="ChatWorkstation"
        />
    </div>
  );
}

export default App;
