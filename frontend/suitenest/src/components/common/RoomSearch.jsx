import React, { useState } from "react";
import moment from "moment";
import { Col, Container, Row, Form, Button } from "react-bootstrap";

import { getAvailableRooms } from "../utils/ApiFunctions";
import RoomTypeSelector from "../common/RoomTypeSelector";
import RoomSearchResult from "./RoomSearchResult";

const RoomSearch = () => {
  const [searchQuery, setSearchQuery] = useState({
    checkInDate: "",
    checkOutDate: "",
    roomType: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = e => {
    e.preventDefault();

    const checkIn = moment(searchQuery.checkInDate);
    const checkOut = moment(searchQuery.checkOutDate);

    if (!checkIn.isValid() || !checkOut.isValid()) {
      setErrorMessage("Please enter valid date range");
      return;
    }

    if (!checkOut.isSameOrAfter(checkIn)) {
      setErrorMessage("Check-out date must be after check-in date");
      return;
    }

    setIsLoading(true);
    getAvailableRooms(searchQuery.checkInDate, searchQuery.checkOutDate, searchQuery.roomType)
      .then(response => {
        setAvailableRooms(response.data);
        setTimeout(() => setIsLoading(false), 2000);
      })
      .catch(err => console.log(err))
      .finally(() => setIsLoading(false));
  };

  const handleInputChange = e => {
    setErrorMessage("");

    const { name, value } = e.target;
    setSearchQuery({ ...searchQuery, [name]: value });
    const checkInDate = moment(searchQuery.checkInDate);
    const checkOutDate = moment(searchQuery.checkOutDate);

    if (checkInDate.isValid() && checkOutDate.isValid()) {
      setErrorMessage("");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery({
      checkInDate: "",
      checkOutDate: "",
      roomType: "",
    });
    setAvailableRooms([]);
  };

  return (
    <>
      <Container className="mt-5 mb-5 py-5 shadow">
        <Form onSubmit={handleSearch}>
          <Row className="justify-content-center">
            <Col xs={12} md={3}>
              <Form.Group controlId="checkInDate">
                <Form.Label>Check-In Date</Form.Label>
                <Form.Control
                  type="date"
                  name="checkInDate"
                  value={searchQuery.checkInDate}
                  onChange={handleInputChange}
                  min={moment().format("YYYY-MM-DD")}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={3}>
              <Form.Group controlId="checkOutDate">
                <Form.Label>Check-Out Date</Form.Label>
                <Form.Control
                  type="date"
                  name="checkOutDate"
                  value={searchQuery.checkOutDate}
                  onChange={handleInputChange}
                  min={
                    searchQuery.checkInDate == ""
                      ? moment().format("YYYY-MM-DD")
                      : searchQuery.checkInDate
                  }
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={3}>
              <Form.Group controlId="roomType">
                <Form.Label>Room Tyoe</Form.Label>
                <div className="d-flex">
                  <RoomTypeSelector
                    handleRoomInputChange={handleInputChange}
                    newRoom={searchQuery}
                  />
                  <Button variant="secondary" type="submit" className="ml-2">
                    Search
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Form>

        {isLoading ? (
          <p className="mt-4">Finding available rooms...</p>
        ) : availableRooms ? (
          <RoomSearchResult results={availableRooms} onClearSearch={handleClearSearch} />
        ) : (
          <p className="mt-4">No Rooms Available for the selected room type in the date range</p>
        )}

        {errorMessage && <p className="text-danger">{errorMessage}</p>}
      </Container>
    </>
  );
};

export default RoomSearch;
