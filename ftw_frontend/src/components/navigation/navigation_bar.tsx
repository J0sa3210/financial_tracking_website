import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Grid,
  GridItem,
  HStack,
  Text,
} from "@chakra-ui/react";

function NavBar() {
  const titles = ["Transactions", "Settings"];

  return (
    <>
      <Box background='primary' p={0} minHeight='70px'>
        <Grid
          templateColumns='repeat(6, 1fr)'
          height='70px'
          alignItems='center'>
          <GridItem colSpan={2} fontFamily='cursive' fontSize='3xl' pl='15px'>
            Financial Tracking Website
          </GridItem>
          <GridItem colSpan={3}>
            <HStack gap={10}>
              <ButtonGroup fontSize='xl'>
                {titles.map((title) => {
                  return (
                    <Button variant='plain' fontSize='2xl' fontFamily='body'>
                      {title}
                    </Button>
                  );
                })}
              </ButtonGroup>
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
