import React, { useEffect, useState } from "react";

import { cancelBooking, getAllBookings } from "../utils/ApiFunctions";
import Header from "../common/Header";
import BookingsTable from "./BookingsTable";

const Bookings = () => {
  const [bookingsInfo, setBookingsInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setTimeout(() => {
      getAllBookings()
        .then(response => {
          setBookingsInfo(response);
          setIsLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setIsLoading(false);
        });
    }, 1000);
  }, []);

  const handleBookingCancellation = async bookingId => {
    try {
      await cancelBooking(bookingId);
      const data = await getAllBookings();
      setBookingsInfo(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section style={{ backgroundColor: "whitesmoke" }}>
      <Header title={"Existing Bookings"} />
      {error && <div className="text-danger">{error}</div>}
      {isLoading ? (
        <div className="mt-5 mb-5 px-5">Loading existing bookings...</div>
      ) : (
        <BookingsTable
          bookingsInfo={bookingsInfo}
          handleBookingCancellation={handleBookingCancellation}
        />
      )}
    </section>
  );
};

export default Bookings;
