import { PageIntro } from "@/shared/components/ui/DashboardPrimitives";
import { Building2 } from "lucide-react";

interface RoomPageHeaderProps {
  title?: string;
  description?: string;
}

export function RoomPageHeader({ 
  title = "Room Management", 
  description = "Configure theater rooms, seats, and seating layouts" 
}: RoomPageHeaderProps) {
  return (
    <PageIntro
      eyebrow="Venue configuration"
      title={title}
      description={description}
      icon={Building2}
      showEvervault={true}
    />
  );
}
