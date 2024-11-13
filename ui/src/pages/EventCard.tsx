import { useEffect, useState } from "react";
import { Link as ChakraLink } from "@chakra-ui/react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Card from "../components/Card/Card.tsx";
import { useEvent } from "../hooks/use-event.ts";
import { Header } from "../components/Header/Header.tsx";
import { remote } from "../routes.ts";
import { Link as ReactRouterLink } from "react-router-dom";
import { Flex } from "@chakra-ui/react";
import { ArrowBackIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { useCollect } from "../hooks/use-collect.ts";
import { useToast } from "@chakra-ui/react";
import { pageTitle } from "../utils/events.ts";
import { usePageTitle } from "../hooks/use-page-title.ts";
import { useConferenceRoles } from "../hooks/use-conference-roles.ts";
import { useLogin } from "../hooks/use-login.ts";
import { useUser } from "../hooks/use-user.ts";
import { PrimaryButton } from "../components/Buttons/PrimaryButton.tsx";
import { useZupassPods } from "../hooks/use-zupass-pods.ts";
import { useZAPIConnect } from "../zapi/connect.ts";
import { useZAPI } from "../zapi/context.tsx";
import { attendancePodType } from "../utils/pod.ts";

export function EventCard() {
  const { uid } = useParams();
  const [searchParams] = useSearchParams();
  const { data: event } = useEvent(uid);
  const { isAuthenticated } = useUser();
  const toast = useToast();
  const { login, isLoading: isLoggingIn } = useLogin({
    onError: (error) => {
      toast({
        title: `Failed to login (${error?.message})`,
        status: "error",
        description: error.message,
        duration: 2000,
      });
    },
  });
  const [isCollected, setIsCollected] = useState(false);
  usePageTitle(pageTitle(event));
  const secret = searchParams.get("secret");
  const [isCollecting, setIsCollecting] = useState(false);
  const { connect } = useZAPIConnect();
  const { collect } = useCollect(event, secret);
  const { isConnected } = useZAPIConnect();
  const { zapi, collection } = useZAPI();
  const { getZupassPods } = useZupassPods();
  const { data: roles } = useConferenceRoles();

  const hasAnyRoles =
    roles?.some((r) => r.conferenceId === event?.conferenceId) ?? false;

  const onCollect = async () => {
    setIsCollecting(true);
    try {
      const zapi = await connect();
      const pods = await getZupassPods(
        zapi,
        collection,
        attendancePodType,
      );
      const hasEventPods = pods.some((p) =>
        p.entries.code.value === event?.uid
      );
      setIsCollected(hasEventPods);

      if (hasEventPods) {
        toast({
          title: "Attendance Already Recorded",
          description: "Open Zupass to view your attendance POD",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      await collect(zapi);
      toast({
        title: "Attendance Recorded",
        description: "Open Zupass to view your attendance POD",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setIsCollected(true);
    } catch (error) {
      toast({
        title: "Error: Failed to record attendance",
        description: `Please try again later. Error: ${error?.message}`,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsCollecting(false);
    }
  };

  useEffect(() => {
    const func = async () => {
      if (isConnected) {
        const pods = await getZupassPods(
          zapi,
          collection,
          attendancePodType,
        );
        const hasEventPods = pods.some((p) =>
          p.entries.code.value === event?.uid
        );
        setIsCollected(hasEventPods);
      }
    };
    func();
  }, [isConnected]);

  const onLogin = async () => {
    await login();
    onCollect();
  };

  const action = isAuthenticated && hasAnyRoles && secret && !isCollected
    ? onCollect
    : secret && !isCollected
    ? onLogin
    : null;

  const hasTempleBackground = event?.features["temple-background"] ?? false;

  return (
    <div className="layout">
      <header className="header">
        <nav>
          <Link as={ReactRouterLink} to={uid ? remote(uid) : ""}>
            <Flex
              flexDirection="row"
              gap="1"
              alignItems="center"
              padding="0.5rem 0 0 1rem"
              minHeight="1rem"
            >
              <ArrowBackIcon /> <span>Controls</span>
            </Flex>
          </Link>
        </nav>
        <div style={{ paddingBottom: "1rem" }}>
          <Header title={`Card: ${event?.title ?? "Loading..."}`} />
        </div>
      </header>
      <main
        className={`content ${hasTempleBackground ? "temple-background" : ""}`}
      >
        <Flex
          flexDirection="column"
          alignItems="center"
          gap="12px"
          textAlign="center"
          padding="1rem 0"
          height="100%"
        >
          <Card event={event} />
          {action
            ? (
              <PrimaryButton
                isLoading={isLoggingIn || isCollecting}
                loadingText="Collecting..."
                onClick={action}
                disabled={isLoggingIn || isCollecting}
              >
                Collect
              </PrimaryButton>
            )
            : isCollected
            ? (
              <p>
                <ChakraLink
                  href="https://zupass.org"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Zupass <ExternalLinkIcon />
                </ChakraLink>{" "}
                to view your attendance PODs.
              </p>
            )
            : (
              <p style={{ marginTop: "auto" }}>
                Scan the Session QR code to collect your attendance
              </p>
            )}
        </Flex>
      </main>
    </div>
  );
}
