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
      <div className={isSelected ? "bg-white text-primary" : "bg-primary "}>
        {title}
      </div>
    </Link>
  );
}
