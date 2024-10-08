package com.sunny.suitenest.controller;

import com.sunny.suitenest.exception.InternalServerException;
import com.sunny.suitenest.exception.PhotoRetreivalException;
import com.sunny.suitenest.exception.ResourceNotFoundException;
import com.sunny.suitenest.model.BookedRoom;
import com.sunny.suitenest.model.Room;
import com.sunny.suitenest.response.BookingResponse;
import com.sunny.suitenest.response.RoomResponse;
import com.sunny.suitenest.service.impl.BookingServiceImpl;
import com.sunny.suitenest.service.impl.RoomServiceImpl;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.codec.binary.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.rowset.serial.SerialBlob;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.sql.Blob;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@RestController
@RequestMapping("/rooms")
public class RoomController {

    private static final Logger logger = LoggerFactory.getLogger(RoomController.class);

    private final RoomServiceImpl roomService;
    private final BookingServiceImpl bookingService;

    @PostMapping("/add/new-room")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<RoomResponse> addNewRoom(@RequestParam("photo") MultipartFile photo,
                                                   @RequestParam("roomType") String roomType,
                                                   @RequestParam("roomPrice") BigDecimal roomPrice) throws SQLException, IOException {
        Room savedRoom = roomService.addNewRoom(photo, roomType, roomPrice);
        RoomResponse response = new RoomResponse(savedRoom.getId(), savedRoom.getRoomType(), savedRoom.getRoomPrice());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/room/types")
    public List<String> getRoomTypes() {
        return roomService.getAllRoomTypes();
    }

    @GetMapping("/all-rooms")
    public ResponseEntity<List<RoomResponse>> getAllRooms() throws SQLException {
        logger.info("Fetching all rooms");
        List<RoomResponse> roomResponses = new ArrayList<>();
        try {
            List<Room> rooms = roomService.getAllRooms();
            for (Room room : rooms) {
                logger.info("Processing room with ID: {}, Type: {}, Price: {}", room.getId(), room.getRoomType(), room.getRoomPrice());

                byte[] photoBytes = roomService.getRoomPhotoByRoomId(room.getId());
                if (photoBytes != null && photoBytes.length > 0) {
                    String base64Photo = Base64.encodeBase64String(photoBytes);

                    RoomResponse roomResponse = getRoomResponse(room);
                    roomResponse.setPhoto(base64Photo);
                    roomResponses.add(roomResponse);
                }
            }
            logger.info("Successfully fetched {} rooms", roomResponses.size());
            return ResponseEntity.ok(roomResponses);
        } catch (PhotoRetreivalException e) {
            logger.error("Error fetching room photo: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/delete/room/{roomId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long roomId) {
        roomService.deleteRoom(roomId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/update/{roomId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable Long roomId,
                                                   @RequestParam(required = false) String roomType,
                                                   @RequestParam(required = false) BigDecimal roomPrice,
                                                   @RequestParam(required = false) MultipartFile photo) throws SQLException, IOException, InternalServerException {

        byte[] photoBytes = photo != null && !photo.isEmpty()
                ? photo.getBytes()
                : roomService.getRoomPhotoByRoomId(roomId);

        Blob photoBlob = photoBytes != null && photoBytes.length > 0
                ? new SerialBlob(photoBytes)
                : null;

        Room room = roomService.updateRoom(roomId, roomType, roomPrice, photoBytes);
        room.setPhoto(photoBlob);

        RoomResponse roomResponse = getRoomResponse(room);

        String base64Photo = Base64.encodeBase64String(photoBytes);
        roomResponse.setPhoto(base64Photo);
        return ResponseEntity.ok(roomResponse);
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<Optional<RoomResponse>> getRoomById(@PathVariable Long roomId) throws SQLException {
        Room room = roomService.getRoomById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found!"));
        RoomResponse roomResponse = getRoomResponse(room);

        try {
            byte[] photoBytes = roomService.getRoomPhotoByRoomId(roomId);
            if (photoBytes != null && photoBytes.length > 0) {
                String base64Photo = Base64.encodeBase64String(photoBytes);
                roomResponse.setPhoto(base64Photo);
            }
        } catch (PhotoRetreivalException e) {
            logger.error("Error fetching room photo: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }

        return ResponseEntity.ok(Optional.of(roomResponse));
    }

    @GetMapping("/available-rooms")
    public ResponseEntity<List<RoomResponse>> getAvailableRooms(
            @RequestParam("checkInDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam("checkOutDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,
            @RequestParam("roomType") String roomType) throws SQLException {

        List<Room> availableRooms = roomService.getAvailableRooms(checkInDate, checkOutDate, roomType);
        List<RoomResponse> roomResponses = new ArrayList<>();

        for (Room room : availableRooms) {
            byte[] photoBytes = roomService.getRoomPhotoByRoomId(room.getId());
            String photoBase64 = (photoBytes != null && photoBytes.length > 0)
                    ? Base64.encodeBase64String(photoBytes)
                    : null;
            RoomResponse roomResponse = getRoomResponse(room);
            roomResponse.setPhoto(photoBase64);
            roomResponses.add(roomResponse);
        }
        if (roomResponses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(roomResponses);
    }


    private RoomResponse getRoomResponse(Room room) {
        List<BookedRoom> bookings = getAllBookingsByRoomId(room.getId());
        List<BookingResponse> bookingInfo = bookings
                .stream()
                .map(booking -> new BookingResponse(
                        booking.getBookingId(),
                        booking.getCheckInDate(),
                        booking.getCheckOutDate(),
                        booking.getBookingConfirmationCode())).toList();

        byte[] photoBytes = null;
        return new RoomResponse(
                room.getId(),
                room.getRoomType(),
                room.getRoomPrice(),
                room.isBooked(),
                photoBytes,
                bookingInfo);
    }

    private List<BookedRoom> getAllBookingsByRoomId(Long roomId) {
        return bookingService.getAllBookingsByRoomId(roomId);
    }

}
