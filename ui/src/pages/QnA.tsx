import { useEvent, useEventUpdates } from "../hooks/use-event.ts";
import { QuestionsSection } from "../components/QnA/QuestionsSection.tsx";
import { Footer } from "../components/QnA/Footer.tsx";
import { Header } from "../components/Header/Header.tsx";
import { useVotes } from "../hooks/use-votes.ts";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import Card from "../components/Card/Card.tsx";
import { useState } from "react";
import { useUser } from "../hooks/use-user.ts";

export function QnA({ uid }: { uid: string }) {
  const { data: event, mutate } = useEvent(uid);
  const { data: user, isAuthenticated } = useUser();
  const { data: _update } = useEventUpdates(uid, {
    onUpdate: () => {
      mutate();
    },
  });

  const { data: votes } = useVotes();
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };

  return (
    <div className="layout">
      <header className="header">
        <Header
          event={event}
          actionButton={null}
        />
      </header>
      <main className="content">
        <Tabs
          colorScheme="purple"
          tabIndex={tabIndex}
          isFitted={true}
          onChange={handleTabsChange}
        >
          <TabList>
            <Tab>Q&A</Tab>
            <Tab>Info</Tab>
          </TabList>

          <TabPanels>
            <TabPanel className="tab-panel" padding={0}>
              <QuestionsSection event={event} votes={votes} />
              <Footer
                event={event}
                user={user}
                isAuthenticated={isAuthenticated}
              />
            </TabPanel>
            <TabPanel padding={0}>
              <Card event={event} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </main>
    </div>
  );
}
