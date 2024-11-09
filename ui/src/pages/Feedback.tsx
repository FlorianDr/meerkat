import { useState } from "react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Checkbox,
  CheckboxGroup,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Link,
  Stack,
  Textarea,
  useCheckboxGroup,
  useToast,
} from "@chakra-ui/react";
import { Link as ReactRouterLink, useParams } from "react-router-dom";
import { usePageTitle } from "../hooks/use-page-title.ts";
import { pageTitle } from "../utils/events.ts";
import { Header } from "../components/Header/Header.tsx";
import { useEvent } from "../hooks/use-event.ts";
import { useUser } from "../hooks/use-user.ts";
import { remote } from "../routes.ts";
import { PrimaryButton } from "../components/Buttons/PrimaryButton.tsx";
import { minimumFieldsToReveal, useLogin } from "../hooks/use-login.ts";
import { useZAPIConnect } from "../zapi/connect.ts";
import { useProvideFeedback } from "../hooks/use-provide-feedback.ts";

export function Feedback() {
  const { uid } = useParams();
  const { data: event } = useEvent(uid);
  usePageTitle(pageTitle(event));
  const { isAuthenticated } = useUser();
  const { connect, isConnecting } = useZAPIConnect();
  const [text, setText] = useState("");
  const { value, getCheckboxProps, setValue } = useCheckboxGroup();
  const { login, isLoading: isLoggingIn } = useLogin({
    fieldsToReveal: {
      ...minimumFieldsToReveal,
      attendeeEmail: value.includes("email") ?? false,
      attendeeName: value.includes("name") ?? false,
    },
  });
  const toast = useToast();

  const { provideFeedback, isLoading: isProvidingFeedback } =
    useProvideFeedback({
      onError: (error) => {
        toast({
          title: "Submission Failed",
          description: error.message,
          status: "error",
        });
      },
    });

  const handleSubmit = async () => {
    if (!event) {
      return;
    }

    const textValue = text.trim();

    if (!textValue) {
      return;
    }

    if (textValue.length > 1000) {
      toast({
        title: "Submission Failed",
        description: "Note must be less than 1000 characters",
        status: "error",
      });
      return;
    }

    let ticketProof: any;
    if (!isAuthenticated || value.length > 0) {
      ({ ticketProof } = await login());
    }

    const zapi = await connect();
    let email: string | undefined;
    if (ticketProof) {
      email = ticketProof.revealedClaims.pods.ticket.entries.attendeeEmail
        ?.value as
          | string
          | undefined;
    }

    let name: string | undefined;
    if (ticketProof) {
      name = ticketProof.revealedClaims.pods.ticket.entries.attendeeName
        ?.value as
          | string
          | undefined;
    }

    await provideFeedback({ zapi, event, text: textValue, email, name });
    setText("");
    setValue([]);
    toast({
      title: "Feedback Submitted",
      description: "Open Zupass to view.",
      status: "success",
    });
  };

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
          <Header title={`Feedback: ${event?.title ?? "Loading..."}`} />
        </div>
      </header>
      <main className="content flex">
        <Flex flexDirection="column" gap="4" marginTop="2rem">
          <FormControl>
            <FormLabel>Private Note</FormLabel>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              resize="vertical"
              size="lg"
              name="text"
              rows={4}
              placeholder="Type your note here..."
              maxLength={1000}
            />
            <FormHelperText>
              Message will be signed with Zupass identity and privately
              delivered to all speakers of this event. Find your given feedback
              in Zupass.
            </FormHelperText>
          </FormControl>
          <FormControl>
            <Stack spacing={5} direction="row">
              <CheckboxGroup>
                <Checkbox {...getCheckboxProps({ value: "name" })} size="lg">
                  Share Name
                </Checkbox>
                <Checkbox {...getCheckboxProps({ value: "email" })} size="lg">
                  Share Email
                </Checkbox>
              </CheckboxGroup>
            </Stack>
          </FormControl>

          <PrimaryButton
            isLoading={isProvidingFeedback || isConnecting || isLoggingIn}
            loadingText="Loading..."
            onClick={handleSubmit}
            alignSelf="flex-end"
            isDisabled={!text.trim()}
          >
            Sign & Submit
          </PrimaryButton>
        </Flex>
      </main>
    </div>
  );
}
