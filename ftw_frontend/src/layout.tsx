import { Container } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import NavBar from "./components/navigation/navigation_bar";

const Layout = () => {
  return (
    <div>
      <NavBar />
      <Container
        maxW='100%'
        px='5%'
        background='gray.200'
        color='text'
        fontFamily='body'>
        <Container maxW='100%' maxH='100%' px='3%' background='background'>
          <Outlet />
        </Container>
      </Container>
    </div>
  );
};

export default Layout;
