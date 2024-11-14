import { RepeatIcon } from "@chakra-ui/icons";
import {
  Badge,
  Button,
  Flex,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Header } from "../components/Header/Header.tsx";
import { useUser } from "../hooks/use-user.ts";
import { useLeaderboard } from "../hooks/use-leaderboard.ts";

export function Leaderboard() {
  const {
    data,
    mutate: refreshLeaderboard,
    isValidating: isLeaderboardLoading,
  } = useLeaderboard();

  const { data: user, mutate: refreshUser, isValidating: isUserLoading } =
    useUser();

  const isUserInLeaderboard = data?.some((p) => p.name === user?.name);

  const refresh = () => {
    refreshLeaderboard();
    refreshUser();
  };

  const isLoading = isLeaderboardLoading || isUserLoading;

  return (
    <div className="layout">
      <header className="header">
        <div style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
          <Header title="Top Participants" />
        </div>
      </header>
      <main className="content flex">
        <TableContainer>
          <Flex justifyContent="flex-end" margin="1rem 0">
            <Button
              leftIcon={<RepeatIcon />}
              onClick={refresh}
              variant="outline"
              disabled={isLoading}
              isLoading={isLoading}
              loadingText="Refreshing..."
            >
              Refresh
            </Button>
          </Flex>
          <Table variant="simple">
            <TableCaption>
              Each answered question is 10 points, every vote is 1 point
            </TableCaption>
            <Thead>
              <Tr>
                <Th>#</Th>
                <Th>Name</Th>
                <Th isNumeric>Points</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.map((participant) => (
                <Tr key={participant.name}>
                  <Td>{participant.rank}</Td>
                  <Td>
                    {participant.name}
                    {participant.name === user?.name && (
                      <>
                        &nbsp;
                        <Badge colorScheme="purple" variant="solid">You!</Badge>
                      </>
                    )}
                  </Td>
                  <Td isNumeric>{participant.points}</Td>
                </Tr>
              ))}
              {!isUserInLeaderboard && user && (
                <Tr key={user.names}>
                  <Td>{user.rank}</Td>
                  <Td>
                    {user.name}&nbsp;
                    <Badge colorScheme="purple" variant="solid">You!</Badge>
                  </Td>
                  <Td isNumeric>{user.points}</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </main>
    </div>
  );
}
