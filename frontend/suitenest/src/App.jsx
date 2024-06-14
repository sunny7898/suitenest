import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "/node_modules/bootstrap/dist/js/bootstrap.min.js";

import Home from "../src/components/home/Home";
import AddRoom from "./components/room/AddRoom";
import ExistingRooms from "./components/room/ExistingRooms";
import EditRoom from "./components/room/EditRoom";
import NavBar from "./components/layout/NavBar";
import Footer from "./components/layout/Footer";

function App() {
  return (
    <main>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-room" element={<AddRoom />} />
          <Route path="/existing-rooms" element={<ExistingRooms />} />
          <Route path="/edit-room/:roomId" element={<EditRoom />} />
        </Routes>
      </Router>
      <Footer />
    </main>
  );
}

export default App;
