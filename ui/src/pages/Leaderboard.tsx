import { ArrowBackIcon, RepeatIcon } from "@chakra-ui/icons";
import {
  Badge,
  Button,
  Flex,
  Link,
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
import { Link as ReactRouterLink, useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

  const isLoading = isLeaderboardLoading || isUserLoading;

  return (
    <div className="layout">
      <header className="header">
        <nav>
          <Link
            as={ReactRouterLink}
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
          >
            <Flex
              flexDirection="row"
              gap="1"
              alignItems="center"
              padding="0.5rem 0 0 1rem"
              minHeight="1rem"
            >
              <ArrowBackIcon /> <span>Back</span>
            </Flex>
          </Link>
        </nav>
        <Header title="Top Participants" />
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
          <Table variant="simple" size="sm">
            <TableCaption>
              Each answered question is 10 points, every vote is 1 point
            </TableCaption>
            <Thead>
              <Tr>
                <Th>#</Th>
                <Th>Name</Th>
                <Th isNumeric>🦄</Th>
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
                  <Td></Td>
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
