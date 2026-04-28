import { PageIntro } from "../../../components/UI/DashboardPrimitives";
import { Calendar } from "lucide-react";

interface SessionPageHeaderProps {
  title?: string;
  description?: string;
}

export function SessionPageHeader({
  title = "Session Management",
  description = "Schedule movie sessions across theater rooms"
}: SessionPageHeaderProps) {
  return (
    <PageIntro
      eyebrow="Schedule operations"
      title={title}
      description={description}
      icon={Calendar}
    />
  );
}
