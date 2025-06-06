import { Link } from "react-router-dom";
import { Text, Box } from "@chakra-ui/react";

interface NavBarButtonProps {
  title: string;
  link: string;
  isSelected: boolean;
}

const NavBarButton: React.FC<NavBarButtonProps> = ({
  title,
  link,
  isSelected,
}) => {
  if (isSelected) {
    return (
      <Link to={link}>
        <Box
          background='background'
          px='10px'
          mt='10px'
          height='60px'
          color='primary'
          borderTopRadius='lg'
          pt='10px'>
          <Text fontSize='2xl' fontFamily='body'>
            {title}
          </Text>
        </Box>
      </Link>
    );
  }

  return (
    <Link to={link}>
      <Box background='primary' px='10px' mt='10px' height='60px' pt='10px'>
        <Text fontSize='2xl' fontFamily='body'>
          {title}
        </Text>
      </Box>
    </Link>
  );
};

export default NavBarButton;
