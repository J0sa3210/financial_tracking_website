import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function NavBarButton({
  title,
  link,
  isSelected,
}: {
  title: string;
  link: string;
  isSelected: boolean;
}) {
  return (
    <Link to={link}>
      <div className={cn("text-xl px-1 font-setting", isSelected && "text-2xl font-bold")}>{title}</div>
    </Link>
  );
}
