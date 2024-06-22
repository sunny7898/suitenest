package com.sunny.suitenest.service.impl;

import com.sunny.suitenest.exception.InvalidBookingRequestException;
import com.sunny.suitenest.exception.ResourceNotFoundException;
import com.sunny.suitenest.model.BookedRoom;
import com.sunny.suitenest.model.Room;
import com.sunny.suitenest.repository.BookingRepository;
import com.sunny.suitenest.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RoomServiceImpl roomService;

    @Override
    public List<BookedRoom> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public List<BookedRoom> getAllBookingsByRoomId(Long roomId) {
        return bookingRepository.findByRoomId(roomId);
    }

    @Override
    public BookedRoom findByBookingConfirmationCode(String confirmationCode) {
        return bookingRepository.findByBookingConfirmationCode(confirmationCode)
                .orElseThrow(() -> new ResourceNotFoundException("No booking found with booking code: "+confirmationCode));
    }

    @Override
    public String saveBooking(Long roomId, BookedRoom bookingRequest) {

        if (bookingRequest.getCheckOutDate().isBefore(bookingRequest.getCheckInDate())){
            throw new InvalidBookingRequestException("Check-in date must come before check-out date");
        }

        Room room = roomService.getRoomById(roomId).get();
        List<BookedRoom> existingBookings = room.getBookings();

        boolean roomIsAvailable = roomIsAvailable(bookingRequest, existingBookings);
        if (roomIsAvailable) {
            room.addBooking(bookingRequest);
            bookingRepository.save(bookingRequest);
        } else {
            throw new InvalidBookingRequestException("Sorry! This room is not available for the selected dates.");
        }
        return bookingRequest.getBookingConfirmationCode();
    }


    @Override
    public void cancelBooking(Long bookingId) {
        bookingRepository.deleteById(bookingId);
    }

    private boolean roomIsAvailable(BookedRoom bookingRequest, List<BookedRoom> existingBookings) {
        return existingBookings.stream().noneMatch(existingBooking ->
            bookingRequest.getCheckInDate().equals(existingBooking.getCheckInDate())
            || bookingRequest.getCheckOutDate().isBefore(existingBooking.getCheckOutDate())
            || (bookingRequest.getCheckInDate().isAfter(existingBooking.getCheckInDate())
            && bookingRequest.getCheckInDate().isBefore(existingBooking.getCheckOutDate()))
            || (bookingRequest.getCheckInDate().isBefore(existingBooking.getCheckInDate())

            && bookingRequest.getCheckOutDate().equals(existingBooking.getCheckOutDate()))
            || (bookingRequest.getCheckInDate().isBefore(existingBooking.getCheckInDate())

            && bookingRequest.getCheckOutDate().isAfter(existingBooking.getCheckOutDate()))

            || (bookingRequest.getCheckInDate().equals(existingBooking.getCheckOutDate())
            && bookingRequest.getCheckOutDate().equals(existingBooking.getCheckInDate()))

            || (bookingRequest.getCheckInDate().equals(existingBooking.getCheckOutDate())
            && bookingRequest.getCheckOutDate().equals(bookingRequest.getCheckInDate()))
        );
    }
}