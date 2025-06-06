import { Avatar, Box, Grid, GridItem, HStack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import NavBarButton from "./navigation_bar_link";

function NavBar() {
  const titles = ["Transactions", "Settings"];
  const links = ["/transactions", "/settings"];

  const current_path = useLocation().pathname;

  return (
    <>
      <Box background='primary' p={0} minHeight='70px'>
        <Grid
          templateColumns='repeat(6, 1fr)'
          height='70px'
          alignItems='center'>
          <GridItem
            colSpan={2}
            fontFamily='cursive'
            fontSize='3xl'
            pl='15px'
            maxW='600px'>
            <Link to='/'>Financial Tracking Website</Link>
          </GridItem>
          <GridItem colSpan={3} justifySelf='start'>
            <HStack gap={10}>
              {titles.map((title: string, index: number) => {
                const link: string = links[index];
                const isSelected: boolean = link === current_path;
                return (
                  <NavBarButton
                    key={index}
                    title={title}
                    link={link}
                    isSelected={isSelected}
                  />
                );
              })}
            </HStack>
          </GridItem>
          <GridItem colSpan={1} justifySelf='end' pr='20px'>
            <HStack gap='5'>
              <Text fontWeight='semibold'>Joeri Winckelmans</Text>
              <Avatar.Root>
                <Avatar.Fallback name='Joeri Winckelmans' />
              </Avatar.Root>
            </HStack>
          </GridItem>
        </Grid>
      </Box>
    </>
  );
}

export default NavBar;
