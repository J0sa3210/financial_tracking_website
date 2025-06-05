import { Box, Container } from "@chakra-ui/react";
import NavBar from "./components/navigation/navigation_bar";

function App() {
  return (
    <>
      <NavBar />
      <Container
        maxW='100%'
        px='5%'
        background='gray.200'
        color='text'
        fontFamily='body'>
        <Container maxW='100%' maxH='100%' px='3%' background='background'>
          <Box minH='100vw'>Hello</Box>
        </Container>
      </Container>
    </>
  );
}

export default App;
