package com.sunny.suitenest.service.impl;

import com.sunny.suitenest.exception.InternalServerException;
import com.sunny.suitenest.exception.ResourceNotFoundException;
import com.sunny.suitenest.model.Room;
import com.sunny.suitenest.repository.RoomRepository;
import com.sunny.suitenest.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.rowset.serial.SerialBlob;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Blob;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
@Transactional
public class RoomServiceImpl implements RoomService {

    private static final Logger logger = LoggerFactory.getLogger(RoomServiceImpl.class);

    private final RoomRepository roomRepository;

    @Override
    public Room addNewRoom(MultipartFile file, String roomType, BigDecimal roomPrice) throws IOException, SQLException {
        Room room = new Room();
        room.setRoomType(roomType);
        room.setRoomPrice(roomPrice);
        if (file != null && !file.isEmpty()) {
            try {
                byte[] photoBytes = file.getBytes();
                Blob photoBlob = new SerialBlob(photoBytes);
                room.setPhoto(photoBlob);
            } catch (SQLException e) {
                throw new SQLException("Error creating Blob from photo bytes: ", e);
            }
        } else {
            throw new IOException("Photo file is empty or not provided.");
        }
        return roomRepository.save(room);
    }

    @Override
    public List<String> getAllRoomTypes() {
        return roomRepository.findDistinctRoomTypes();
    }

    @Override
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    @Override
    public byte[] getRoomPhotoByRoomId(Long roomId) throws SQLException {
        Optional<Room> room = roomRepository.findById(roomId);
        if (room.isEmpty()) {
            throw new ResourceNotFoundException("Sorry! Room not found.");
        }
        Blob photoBlob = room.get().getPhoto();
        if (photoBlob == null) {
            logger.warn("No photo found for roomId: {}", roomId);
            return null;
        }

        try {
            long length = photoBlob.length();
            logger.debug("Blob length for roomId {}: {}", roomId, length);

            if (length > Integer.MAX_VALUE) {
                logger.error("Blob size is too large for roomId: {}", roomId);
                throw new SQLException("Blob size exceeds maximum allowed length");
            }

            byte[] photoBytes = photoBlob.getBytes(1, (int) length);
            logger.debug("Successfully fetched photo for roomId: {}", roomId);
            return photoBytes;
        } catch (SQLException e) {
            logger.error("Error retrieving bytes from Blob for roomId: {}", roomId, e);
            throw e; // Re-throw to handle at higher level if needed
        }
        //return photoBlob.getBytes(1, (int) photoBlob.length());
    }

    @Override
    public void deleteRoom(Long roomId) {
        Optional<Room> room = roomRepository.findById(roomId);
        if (room.isPresent()) {
            roomRepository.deleteById(roomId);
        }
    }

    @Override
    public Room updateRoom(Long roomId, String roomType, BigDecimal roomPrice, byte[] photoBytes) throws InternalServerException {
        Room room = roomRepository.findById(roomId).get();
        if (roomType != null) room.setRoomType(roomType);
        if (roomPrice != null) room.setRoomPrice(roomPrice);
        if (photoBytes != null && photoBytes.length > 0) {
            try {
                room.setPhoto(new SerialBlob(photoBytes));
            } catch (SQLException e) {
                throw new InternalServerException("Error updating room");
            }
        }
        return roomRepository.save(room);
    }

    @Override
    public Optional<Room> getRoomById(Long roomId) {
        return Optional.of(roomRepository.findById(roomId).get());
    }

    @Override
    public List<Room> getAvailableRooms(LocalDate checkInDate, LocalDate checkOutDate, String roomType) {
        return roomRepository.findAvailableRoomsByDatesAndType(checkInDate, checkOutDate, roomType);
    }
}
