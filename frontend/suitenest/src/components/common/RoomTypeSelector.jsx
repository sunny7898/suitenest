import React, { useState, useEffect } from "react";

import { getRoomTypes } from "../utils/ApiFunctions";

const RoomTypeSelector = ({ handleRoomInputChange, newRoom }) => {
  const [roomTypes, setRoomTypes] = useState([""]);
  const [showNewRoomTypeInput, setShowNewRoomTypeInput] = useState(false);
  const [newRoomType, setNewRoomType] = useState("");

  useEffect(() => {
    getRoomTypes().then(data => {
      setRoomTypes(data);
    });
  }, []);

  const handleNewRoomTypeInputChange = e => {
    setNewRoomType(e.target.value);
  };

  const handleAddNewRoomType = () => {
    if (newRoomType !== "") {
      setRoomTypes([...roomTypes, newRoomType]);
      setNewRoomType("");
      setShowNewRoomTypeInput(false);
    }
  };

  return (
    <>
      {roomTypes.length >= 0 && (
        <div>
          <select
            required
            className="form-select"
            name="roomType"
            onChange={e => {
              if (e.target.value === "Add New") {
                setShowNewRoomTypeInput(true);
              } else {
                // Else prevents the adding of "Add New" as a roomtype by mistake
                handleRoomInputChange(e);
              }
            }}
            value={newRoom.roomType}
          >
            {roomTypes.length > 0 ? (
              <option disabled selected value="">
                -- Select a room type --
              </option>
            ) : (
              <option disabled selected value="">
                -- Select an option --
              </option>
            )}
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
      )}
    </>
  );
};

export default RoomTypeSelector;
