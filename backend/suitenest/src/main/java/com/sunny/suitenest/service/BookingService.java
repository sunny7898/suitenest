package com.sunny.suitenest.service;

import com.sunny.suitenest.model.BookedRoom;

import java.util.List;

public interface BookingService {
    public List<BookedRoom> getAllBookingsByRoomId(Long roomId);
}
