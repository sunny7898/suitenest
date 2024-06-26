import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:9192",
});

/* This function adds a new room to the database */
export async function addRoom(photo, roomType, roomPrice) {
  const formData = new FormData();
  formData.append("photo", photo);
  formData.append("roomType", roomType);
  formData.append("roomPrice", roomPrice);

  const response = await api.post("/rooms/add/new-room", formData);
  if (response.status === 201) {
    return true;
  }
  return false;
}

/* This function gets all room types from database */
export async function getRoomTypes() {
  try {
    const response = await api.get("/rooms/room/types");
    return response.data;
  } catch (err) {
    throw new Error("Error fetching room types. Error: " + err.message);
  }
}

/* This function gets all rooms from the database */
export async function getAllRooms() {
  try {
    const response = await api.get("/rooms/all-rooms");
    return response.data;
  } catch (err) {
    throw new Error("Error fetching rooms. Error: " + err.message);
  }
}

/* This function deletes room by roomId from the database */
export async function deleteRoom(roomId) {
  try {
    const response = await api.delete(`/rooms/delete/room/${roomId}`);
    return response.data;
  } catch (err) {
    throw new Error(`Error deleting room. Error: ${err.message}`);
  }
}

/* This function updates room by roomId in the database */
export async function updateRoom(roomId, roomData) {
  const formData = new FormData();
  formData.append("roomType", roomData.roomType);
  formData.append("roomPrice", roomData.roomPrice);
  formData.append("photo", roomData.photo);
  const response = await api.put(`/rooms/update/${roomId}`, formData);
  return response;
}

/* This function fetches room by roomId from the database */
export async function getRoomById(roomId) {
  try {
    const response = await api.get(`/rooms/room/${roomId}`);
    return response.data;
  } catch (err) {
    throw new Error(`Error fetching room details for Room No. ${roomId}. Error: ${err.message}`);
  }
}

/* This function saves a new booking to the database */
export async function bookRoom(roomId, booking) {
  try {
    const response = await api.post(`/bookings/room/${roomId}/booking`, booking);
    return response.data;
  } catch (err) {
    if (err.response && err.response.data) {
      throw new Error(err.response.data);
    } else {
      throw new Error(`Error booking room: ${err.message}`);
    }
  }
}

/* This function is fetch all bookings from the database */
export async function getAllBookings() {
  try {
    const response = await api.get("/bookings/all-bookings");
    return response.data;
  } catch (err) {
    throw new Error(`Error fetching bookings: ${err.message}`);
  }
}

/* This function is to get booking from the database by using confirmation code */
export async function getBookingByConfirmationCode(confirmationCode) {
  try {
    const response = await api.get(`/bookings/confirmation/${confirmationCode}`);
    return response.data;
  } catch (err) {
    if (err.response && err.response.data) {
      console.log(err.response);
      throw new Error(err.response.data);
    } else {
      throw new Error(`Error finding booking : ${err.message}`);
    }
  }
}

/* This function cancels booking */
export async function cancelBooking(bookingId) {
  try {
    const result = await api.delete(`/bookings/booking/${bookingId}/delete`);
    return result.data;
  } catch (err) {
    throw new Error(`Error cancelling the booking: ${err.message}`);
  }
}

/* This function retrieves available room types between the checkin and checkout date */
export async function getAvailableRooms(checkInDate, checkOutDate, roomType) {
  const result = await api.get(
    `/rooms/available-rooms/?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&roomType=${roomType}`
  );
  return result;
}
