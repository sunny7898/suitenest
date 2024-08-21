import React from "react";
import MainHeader from "../layout/MainHeader";
import Parallax from "../common/Parallax";
import HotelService from "../common/HotelService";
import RoomCarousel from "../common/RoomCarousel";
import RoomSearch from "../common/RoomSearch";
import { useLocation } from "react-router-dom";

function Home() {
  const location = useLocation();
  const message = location.state && location.state.message;

  const currentUser = localStorage.getItem("userId");

  return (
    <section>
      {message && <p className="text-warning px-5 mt-3">{message}</p>}
      {currentUser && (
        <h6 className="text-success text-center mt-2">You are Logged in as {currentUser}</h6>
      )}
      <MainHeader />
      <div className="container">
        <RoomSearch />
        <RoomCarousel />
        <Parallax />
        <RoomCarousel />
        <HotelService />
        <Parallax />
        <RoomCarousel />
      </div>
    </section>
  );
}

export default Home;
