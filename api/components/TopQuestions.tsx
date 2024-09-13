/** @jsxImportSource @hono/hono/jsx */
import { type FC } from "@hono/hono/jsx";
import { QuestionWithVotes } from "../models/questions.ts";
import { ArrowUpIcon } from "./assets/arrow-up.ts";

interface TopQuestionsProps {
  questions: QuestionWithVotes[];
  participants: number;
}

const TopQuestions: FC<TopQuestionsProps> = (
  { questions, participants },
) => {
  const votes = questions.reduce((acc, question) => acc + question.votes, 0);
  return (
    <div className="top-questions-layout">
      <header className="top-questions-header">
        <h2 className="header-title">
          Top Questions{" "}
          <span className="question-count">
            ({questions.length ?? "Loading..."})
          </span>
        </h2>
      </header>
      <main className="top-questions-content">
        <ol>
          {questions.sort((a, b) => b.votes - a.votes).map((question) => (
            <li key={question.uid} className="bubble">
              <h2>
                {question.question}
              </h2>
              <div className="upvote-section">
                <div className="upvote-count">{question.votes ?? 0}</div>
                <div dangerouslySetInnerHTML={{ __html: ArrowUpIcon }} />
              </div>
            </li>
          ))}
        </ol>
      </main>
      <footer className="top-questions-footer">
        <h2>
          Attendees <span className="question-count">({participants})</span>
        </h2>
        <h2>
          Votes <span className="question-count">({votes})</span>
        </h2>
      </footer>
    </div>
  );
};

export default TopQuestions;
