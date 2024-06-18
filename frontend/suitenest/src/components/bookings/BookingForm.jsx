import React, { useEffect, useState } from "react";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { Form, FormControl, Button, FormLabel } from "react-bootstrap";

import { bookRoom, getRoomById } from "../utils/ApiFunctions";
import BookingSummary from "./BookingSummary";

const BookingForm = () => {
  const [validated, setValidated] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [roomPrice, setRoomPrice] = useState(0);
  const [booking, setBooking] = useState({
    guestFullName: "",
    guestEmail: "",
    checkInDate: "",
    checkOutDate: "",
    numberOfAdults: "",
    numberOfChildren: "",
  });
  const [roomInfo, setRoomInfo] = useState({ photo: "", roomType: "", roomPrice: "" });

  const { roomId } = useParams();
  const navigate = useNavigate();

  const handleInputChange = e => {
    const { name, value } = e.target;
    setBooking({ ...booking, [name]: value });
    setErrorMessage("");
  };

  const getRoomPriceById = async roomId => {
    try {
      const response = await getRoomById(roomId);
      setRoomPrice(response.roomPrice);
    } catch (err) {
      throw new Error(err);
    }
  };

  useEffect(() => {
    getRoomPriceById(roomId);
  }, [roomId]);

  const calculatePayment = () => {
    const checkInDate = moment(booking.checkInDate);
    const checkOutDate = moment(booking.checkOutDate);
    const diffInDays = checkOutDate.diff(checkInDate, "days");
    const paymentPerDay = roomPrice ? roomPrice : 0;
    return diffInDays * paymentPerDay;
  };

  const isGuestCountValid = () => {
    const adultCount = parseInt(booking.numberOfAdults);
    const childrenCount = parseInt(booking.numberOfChildren);
    const totalCount = adultCount + childrenCount;
    return totalCount >= 1 && adultCount >= 1;
  };

  const isCheckOutDateValid = () => {
    if (!moment(booking.checkOutDate).isSameOrAfter(moment(booking.checkInDate))) {
      setErrorMessage("Check-out date must be after check-in date");
      return false;
    } else {
      setErrorMessage("");
      return true;
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false || !isGuestCountValid || !isCheckOutDateValid) {
      e.stopPropagation();
    } else {
      setIsSubmitted(true);
    }
    setValidated(true);
  };

  const handleFormSubmit = async () => {
    try {
      const confirmationCode = await bookRoom(roomId, booking);
      setIsSubmitted(true);
      navigate("/booking-success", { state: { message: confirmationCode } });
    } catch (err) {
      const errorMessage = err.message;
      navigate("/booking-success", { state: { error: errorMessage } });
    }
  };

  return (
    <>
      <div className="container mb-5">
        <div className="row">
          <div className="col-md-6">
            <div className="card card-body mt-5">
              <h4 className="card-title">Reserve Room</h4>

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group>
                  <Form.Label htmlFor="guestFullName" className="hotel-color">
                    Full Name
                  </Form.Label>
                  <Form.Control
                    required
                    type="text"
                    id="guestFullName"
                    name="guestFullName"
                    value={booking.guestFullName}
                    placeholder="Enter your full name"
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter your full name.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group>
                  <Form.Label htmlFor="guestEmail" className="hotel-color">
                    Email
                  </Form.Label>
                  <Form.Control
                    required
                    type="email"
                    id="guestEmail"
                    name="guestEmail"
                    value={booking.guestEmail}
                    placeholder="Enter your email"
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid email address.
                  </Form.Control.Feedback>
                </Form.Group>

                <fieldset style={{ border: "2px" }}>
                  <legend>Lodging Period</legend>
                  <div className="row">
                    <div className="col-6">
                      <Form.Label htmlFor="checkInDate" className="hotel-color">
                        Check-in date
                      </Form.Label>
                      <Form.Control
                        required
                        type="date"
                        id="checkInDate"
                        name="checkInDate"
                        value={booking.checkInDate}
                        placeholder="check-in-date"
                        min={moment().format("MMM Do, YYYY")}
                        onChange={handleInputChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please select a check-in-date
                      </Form.Control.Feedback>
                    </div>

                    <div className="col-6">
                      <Form.Label htmlFor="checkOutDate" className="hotel-color">
                        Check-out date
                      </Form.Label>
                      <Form.Control
                        required
                        type="date"
                        id="checkOutDate"
                        name="checkOutDate"
                        value={booking.checkOutDate}
                        placeholder="check-out-date"
                        min={moment().format("MMM Do, YYYY")}
                        onChange={handleInputChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please select a check-out-date
                      </Form.Control.Feedback>
                    </div>

                    {errorMessage && <p className="error-message text-danger">{errorMessage}</p>}
                  </div>
                </fieldset>

                <fieldset style={{ border: "2px" }}>
                  <legend>Number of Guests</legend>
                  <div className="row">
                    <div className="col-6">
                      <Form.Label htmlFor="numberOfAdults" className="hotel-color">
                        Adults
                      </Form.Label>
                      <Form.Control
                        required
                        type="number"
                        id="numberOfAdults"
                        name="numberOfAdults"
                        min={1}
                        placeholder="0"
                        value={booking.numberOfAdults}
                        onChange={handleInputChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please select at least 1 adult.
                      </Form.Control.Feedback>
                    </div>

                    <div className="col-6">
                      <Form.Label htmlFor="numberOfChildren" className="hotel-color">
                        Children
                      </Form.Label>
                      <Form.Control
                        required
                        type="number"
                        id="numberOfChildren"
                        name="numberOfChildren"
                        placeholder="0"
                        min={0}
                        value={booking.numberOfChildren}
                        onChange={handleInputChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Select 0 if no children
                      </Form.Control.Feedback>
                    </div>
                  </div>
                </fieldset>

                <div className="form-group mt-2 mb-2">
                  <button type="submit" className="btn btn-hotel">
                    Continue
                  </button>
                </div>
              </Form>
            </div>
          </div>

          <div className="col-md-4">
            {isSubmitted && (
              <BookingSummary
                booking={booking}
                payment={calculatePayment()}
                isFormValid={validated}
                onConfirm={handleFormSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingForm;
