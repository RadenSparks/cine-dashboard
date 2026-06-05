import AppButton from "@/shared/components/ui/AppButton";
import type { Room, Seat } from "@/shared/types/entities";
import { TableRowWithHover } from "@/shared/components/ui/TableRowHoverEffect";

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
          variant="solid"
          color="success"
          onClick={onCreate}
        >
          + Create Room
        </AppButton>
      </div>
      <div className="w-full overflow-x-auto rounded-lg shadow hide-scrollbar max-h-96">
        <table className="min-w-full w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-blue-50 dark:bg-zinc-800 font-asul text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Asul, sans-serif' }}>
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
                <TableRowWithHover
                  key={room.id}
                  deleted={isDisabled}
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
                            variant="solid"
                            color="primary"
                            size="sm"
                            onClick={() => onConfig(room)}
                          >
                            Configure
                          </AppButton>
                          <AppButton
                            variant="solid"
                            color="default"
                            size="sm"
                            onClick={() => onEdit(room)}
                          >
                            Edit
                          </AppButton>
                          <AppButton
                            variant="solid"
                            color="danger"
                            size="sm"
                            onClick={() => onDelete(room.id)}
                          >
                            Disable
                          </AppButton>
                        </>
                      ) : (
                        <AppButton
                          variant="solid"
                          color="success"
                          size="sm"
                          onClick={() => onReactivate(room.id)}
                        >
                          Reactivate
                        </AppButton>
                      )}
                    </div>
                  </td>
                </TableRowWithHover>
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