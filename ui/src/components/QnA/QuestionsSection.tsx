import { Event } from "../../hooks/use-event.ts";

export function QuestionsSection({ event }: { event: Event | undefined }) {
  return (
    <main className="content">
      <ol>
        {event?.questions.map((question) => {
          <li key={question.uid} className="bubble">
            <Heading as="h3" color="white" size="sm" mb={2}>
              {question.question}
            </Heading>
            <div className="upvote-section">
              <div className="upvote-count">5</div>
              <UpVoteButton />
            </div>
          </li>;
        })}
      </ol>
    </main>
  );
}
