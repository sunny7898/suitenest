import React, { useState, useEffect } from "react";

import { getRoomTypes } from "../utils/ApiFunctions";

const RoomTypeSelector = ({ handleRoomInputChange, newRoom }) => {
  const [roomTypes, setRoomTypes] = useState([""]);
  const [showNewRoomTypeInput, setShowNewRoomTypeInput] = useState(false);
  const [newRoomType, setNewRoomType] = useState("");

  useEffect(() => {
    // Fetch room types when the component mounts
    const fetchRoomTypes = async () => {
      const data = await getRoomTypes();
      setRoomTypes(data);
    };

    fetchRoomTypes();
  }, []);

  const handleNewRoomTypeInputChange = e => {
    setNewRoomType(e.target.value);
  };

  const handleAddNewRoomType = () => {
    if (newRoomType.trim()) {
      setRoomTypes(prevRoomTypes => [...prevRoomTypes, newRoomType.trim()]);
      setNewRoomType("");
      setShowNewRoomTypeInput(false);
      handleRoomInputChange({ target: { name: "roomType", value: newRoomType.trim() } }); // Update parent state
    }
  };
  const handleSelectChange = e => {
    const { value } = e.target;
    if (value === "Add New") setShowNewRoomTypeInput(true);
    else handleRoomInputChange(e);
  };

  return (
    <div>
      <select
        required
        className="form-select"
        name="roomType"
        onChange={handleSelectChange}
        value={newRoom.roomType || ""}
      >
        <option value="" disabled>
          {roomTypes.length > 0 ? "-- Select a room type --" : "-- Select an option --"}
        </option>
        <option value="Add New">Add new room type</option>
        {roomTypes.map((type, index) => (
          <option key={index} value={type}>
            {type}
          </option>
        ))}
      </select>

      {showNewRoomTypeInput && (
        <div className="mt-2">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Enter New Room Type"
              value={newRoomType}
              onChange={handleNewRoomTypeInputChange}
            />
            <button className="btn btn-hotel" type="button" onClick={handleAddNewRoomType}>
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomTypeSelector;
