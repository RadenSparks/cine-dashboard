import AppButton from "../../../components/UI/AppButton";
import type { Room, Seat } from "../../../entities/type";

interface RoomTableProps {
  rooms: Room[];
  seatsByRoom: Record<number, Seat[]>;
  onConfig: (room: Room) => void;
  onEdit: (room: Room) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
  onReactivate: (id: number) => void;
}

export default function RoomTable({
  rooms,
  seatsByRoom,
  onConfig,
  onEdit,
  onDelete,
  onCreate,
  onReactivate,
}: RoomTableProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-blue-700 dark:text-blue-200">Rooms</h3>
        <AppButton
          className="bg-gradient-to-r from-green-600 to-green-400 text-white px-4 py-2 rounded shadow hover:scale-105 transition-transform"
          onClick={onCreate}
        >
          + Create Room
        </AppButton>
      </div>
      <div className="w-full overflow-x-auto rounded-lg shadow hide-scrollbar max-h-96">
        <table className="min-w-full w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-blue-50 dark:bg-zinc-800 font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>
              <th className="p-3 text-left font-semibold">Name</th>
              <th className="p-3 text-center font-semibold">Capacity</th>
              <th className="p-3 text-center font-semibold">Rows</th>
              <th className="p-3 text-center font-semibold">Columns</th>
              <th className="p-3 text-center font-semibold">Premium Seats</th>
              <th className="p-3 text-center font-semibold">Empty Seats</th>
              <th className="p-3 text-center font-semibold">Status</th>
              <th className="p-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => {
              const roomSeats = seatsByRoom[room.id] || [];
              const premiumCount = roomSeats.filter(s => s.seatType === 'PREMIUM' && !s.empty).length;
              const emptyCount = roomSeats.filter(s => s.empty).length;
              const isDisabled = !!room.deleted;
              return (
                <tr
                  key={room.id}
                  className={`border-t transition hover:bg-blue-50 dark:hover:bg-zinc-800 font-farro ${
                    isDisabled ? "bg-gray-100 dark:bg-zinc-900 text-gray-400" : ""
                  }`}
                  style={{ fontFamily: 'Farro, sans-serif' }}
                >
                  <td className={`p-3 font-bold ${isDisabled ? "text-gray-400" : "text-blue-700 dark:text-blue-200"}`}>{room.roomName}</td>
                  <td className="p-3 text-center">{room.capacity}</td>
                  <td className="p-3 text-center">{room.rowSize}</td>
                  <td className="p-3 text-center">{room.columnSize}</td>
                  <td className="p-3 text-center">{premiumCount}</td>
                  <td className="p-3 text-center">{emptyCount}</td>
                  <td className="p-3 text-center">
                    {isDisabled ? (
                      <span className="text-red-500 font-semibold">Disabled</span>
                    ) : (
                      <span className="text-green-600 font-semibold">Active</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex gap-2 justify-center">
                      {!isDisabled ? (
                        <>
                          <AppButton
                            className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-3 py-1 rounded shadow hover:scale-105 transition-transform"
                            onClick={() => onConfig(room)}
                          >
                            Configure
                          </AppButton>
                          <AppButton
                            className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-white px-3 py-1 rounded shadow hover:scale-105 transition-transform"
                            onClick={() => onEdit(room)}
                          >
                            Edit
                          </AppButton>
                          <AppButton
                            className="bg-gradient-to-r from-red-600 to-red-400 text-white px-3 py-1 rounded shadow hover:scale-105 transition-transform"
                            onClick={() => onDelete(room.id)}
                          >
                            Disable
                          </AppButton>
                        </>
                      ) : (
                        <AppButton
                          className="bg-gradient-to-r from-green-600 to-green-400 text-white px-3 py-1 rounded shadow hover:scale-105 transition-transform"
                          onClick={() => onReactivate(room.id)}
                        >
                          Reactivate
                        </AppButton>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {rooms.length === 0 && (
              <tr>
                <td colSpan={8} className="p-3 text-center text-gray-400">No rooms found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}