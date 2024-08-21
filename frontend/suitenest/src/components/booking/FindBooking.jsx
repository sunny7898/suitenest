import React, { useState } from "react";
import moment from "moment";

import { cancelBooking, getBookingByConfirmationCode } from "../utils/ApiFunctions";

const FindBooking = () => {
  const [confirmationCode, setConfirmationCode] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [bookingInfo, setBookingInfo] = useState({
    id: "",
    room: { id: "", roomType: "" },
    bookingConfirmationCode: "",
    roomNumber: "",
    checkInDate: "",
    checkOutDate: "",
    guestFullName: "",
    guestEmail: "",
    numOfAdults: "",
    numOfChildren: "",
    totalNumOfGuest: "",
  });
  const [isDeleted, setIsDeleted] = useState(false);

  const emptyBookingInfo = {
    id: "",
    room: { id: "", roomType: "" },
    bookingConfirmationCode: "",
    roomNumber: "",
    checkInDate: "",
    checkOutDate: "",
    guestFullName: "",
    guestEmail: "",
    numOfAdults: "",
    numOfChildren: "",
    totalNumOfGuest: "",
  };

  const handleInputChange = e => {
    setConfirmationCode(e.target.value);
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await getBookingByConfirmationCode(confirmationCode);
      setBookingInfo(data);
      setError(null);
    } catch (err) {
      setBookingInfo(emptyBookingInfo);
      if (err.response && err.response.status === 404) {
        setError(err.response.data.message);
      } else {
        setError(err.message);
      }
    }
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleBookingCancellation = async () => {
    try {
      await cancelBooking(bookingInfo.id);
      setIsDeleted(true);
      setSuccessMessage("Booking has been cancelled successfully!");
      setBookingInfo(emptyBookingInfo);
      setConfirmationCode("");
      setError(null);
    } catch (err) {
      setError(err.message);
      setIsDeleted(false);
    }
    setTimeout(() => {
      setSuccessMessage("");
      setIsDeleted(false);
    }, 2000);
  };

  return (
    <>
      <div className="container mt-5 d-flex flex-column justify-content-center align-items-center">
        <h2 className="text-center mb-4">Find My Booking</h2>

        <form className="col-md-6" onSubmit={handleFormSubmit}>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              id="confirmationCode"
              name="confirmationCode"
              value={confirmationCode}
              onChange={handleInputChange}
              placeholder="Enter the booking confirmation code"
            />
            <button type="submit" className="btn btn-hotel input-group-text">
              Find Booking
            </button>
          </div>
        </form>

        {isLoading ? (
          <div>Finding your booking...</div>
        ) : error ? (
          <div className="text-danger">Error: {error}</div>
        ) : (
          bookingInfo.bookingConfirmationCode && (
            <div className="col-md-6 mt-4 mb-5">
              <h3>Booking Information</h3>
              <p className="text-success">
                Booking Confirmation Code: {bookingInfo.bookingConfirmationCode}
              </p>
              <p>Booking ID: {bookingInfo.id} </p>
              <p>Room No.: {bookingInfo.room.id}</p>
              <p>Room Type: {bookingInfo.room.roomType}</p>
              <p>
                Check-in Date:
                {" " + moment(bookingInfo.checkInDate).subtract(1, "month").format("MMM Do, YYYY")}
              </p>
              <p>
                Check-out Date:
                {" " + moment(bookingInfo.checkOutDate).subtract(1, "month").format("MMM Do, YYYY")}
              </p>
              <p>Full name: {bookingInfo.guestFullName}</p>
              <p>Email Address: {bookingInfo.guestEmail}</p>
              <p>Adults: {bookingInfo.numOfAdults}</p>
              <p>Children: {bookingInfo.numOfChildren}</p>
              <p>Total Guest: {bookingInfo.totalNumOfGuest}</p>

              {!isDeleted && (
                <button
                  className="btn btn-danger"
                  onClick={() => handleBookingCancellation(bookingInfo.id)}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          )
        )}
        {isDeleted && <div className="alert alert-success mt-3 fade show">{successMessage}</div>}
      </div>
    </>
  );
};

export default FindBooking;
