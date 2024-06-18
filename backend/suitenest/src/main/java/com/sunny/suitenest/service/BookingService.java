package com.sunny.suitenest.service;

import com.sunny.suitenest.model.BookedRoom;

import java.util.List;

public interface BookingService {
    public List<BookedRoom> getAllBookingsByRoomId(Long roomId);
    public List<BookedRoom> getAllBookings();

    public BookedRoom findByBookingConfirmationCode(String confirmationCode) ;

    public String saveBooking(Long roomId, BookedRoom bookingRequest);

    public void cancelBooking(Long bookingId) ;
}
