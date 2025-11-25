import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./content/Home";
import Library from "./content/Library";
import Profile from "./content/Profile";
import Courses from "./content/Courses";
import Contact from "./content/Contact";
import Content from "./content/Content";
import Privacy from "./content/Privacy";
import Terms from "./content/Terms";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/courses" element={<Courses/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/content" element={<Content/>}/>
        <Route path="/privacy" element={<Privacy/>}/>
        <Route path="/terms" element={<Terms/>}/>


      </Routes>
    </Router>
  );
}

export default App;
