import { SectionCard } from "../../../components/UI/DashboardPrimitives";
import RoomTable from "../rooms/RoomTable";
import type { Room, Seat } from "../../../entities/type";

interface RoomListSectionProps {
  rooms: Room[];
  seatsByRoom: Record<number, Seat[]>;
  onConfig: (room: Room) => void;
  onEdit: (room: Room) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
  onReactivate: (id: number) => void;
}

export function RoomListSection({
  rooms,
  seatsByRoom,
  onConfig,
  onEdit,
  onDelete,
  onCreate,
  onReactivate,
}: RoomListSectionProps) {
  return (
    <SectionCard title="Room inventory" description="Manage theater rooms, their capacity, and seating configurations.">
      <RoomTable
        rooms={rooms}
        seatsByRoom={seatsByRoom}
        onConfig={onConfig}
        onEdit={onEdit}
        onDelete={onDelete}
        onCreate={onCreate}
        onReactivate={onReactivate}
      />
    </SectionCard>
  );
}
