import {
  Button,
  Card,
  CardBody,
  Heading,
  Stack,
  StackDivider,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { Header } from "../components/Header/Header.tsx";
import { useUser } from "../hooks/use-user.ts";
import { PrimaryButton } from "../components/Buttons/PrimaryButton.tsx";
import { minimumFieldsToReveal, useLogin } from "../hooks/use-login.ts";
import { useZAPIConnect } from "../zapi/connect.ts";
import { usePods } from "../hooks/use-pods.ts";
import { type ParcnetAPI } from "@parcnet-js/app-connector";
import { EventPod } from "../types.ts";
import { useZAPI } from "../zapi/context.tsx";
import { posthog } from "posthog-js";

export function Speaker() {
  const { login, isLoading } = useLogin({
    fieldsToReveal: {
      ...minimumFieldsToReveal,
      attendeeEmail: true,
    },
  });
  const { data: user } = useUser();
  const { connect } = useZAPIConnect();
  const { collection } = useZAPI();
  const { data: pods, mutate: refreshPods, isLoading: isLoadingPods } =
    usePods();
  const [collected, setCollected] = useState<string[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);
  const toast = useToast();

  const collect = async (pod: EventPod) => {
    setIsCollecting(true);
    try {
      const zapi = await connect();
      await (zapi as ParcnetAPI).pod.collection(collection)
        .insert(pod.pod);

      setCollected([...collected, pod.uid]);

      toast({
        title: "Feedback Collected",
        description: "Open Zupass to view it",
        status: "success",
      });
      posthog.capture("feedback_collected", {
        event_uid: pod.event.uid,
      });
    } catch (error) {
      toast({
        title: `Error collecting feedback for ${pod.event.title}`,
        description: `Error: ${error?.message}`,
        status: "error",
      });
    } finally {
      setIsCollecting(false);
    }
  };

  const handleLogin = async () => {
    await login();
    refreshPods();
  };

  const isEmailVerified = user?.hash;

  const filteredPods = pods?.filter((pod) => !collected.includes(pod.uid));

  return (
    <div className="layout">
      <header className="header">
        <div style={{ paddingBottom: "1rem", paddingTop: "1rem" }}>
          <Header title="Feedback" />
        </div>
      </header>
      <main
        className="content flex"
        style={{ gap: "1rem", marginTop: "1rem", alignItems: "center" }}
      >
        <ul style={{ display: "flex", gap: "1rem", flexFlow: "column" }}>
          {isLoadingPods
            ? <Text textAlign="center">Loading...</Text>
            : filteredPods?.length === 0
            ? <Text textAlign="center">No feedback to collect</Text>
            : filteredPods?.map((pod) => (
              <li
                key={pod.uid}
              >
                <Pod
                  pod={pod}
                  collect={collect}
                  isConnecting={isCollecting}
                />
              </li>
            ))}
        </ul>
        {!isEmailVerified && (
          <PrimaryButton
            onClick={handleLogin}
            isLoading={isLoading}
            loadingText="Logging in..."
          >
            Login
          </PrimaryButton>
        )}
      </main>
    </div>
  );
}

function Pod(
  { pod, isConnecting, collect }: {
    pod: EventPod;
    isConnecting: boolean;
    collect: (pod: EventPod) => Promise<void>;
  },
) {
  return (
    <Card>
      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Heading size="md">{pod.event.title}</Heading>
          <Text>
            {pod.pod.entries.zupass_description.value}
          </Text>
          <Button
            variant="outline"
            fontWeight="bold"
            py={6}
            onClick={() => collect(pod)}
            isLoading={isConnecting}
            loadingText="Collecting..."
          >
            Collect
          </Button>
        </Stack>
      </CardBody>
    </Card>
  );
}
