/** @jsxImportSource @hono/hono/jsx */
import { type FC } from "@hono/hono/jsx";
import { Question } from "../models/questions.ts";
import { ArrowUpIcon } from "./assets/arrow-up.ts";

const TopQuestions: FC<{ questions: Question[] }> = ({ questions }) => {
  // QUESTION:
  // 1. do we want questions to be scrollable?  currently - `overflow-y: scroll` ;
  // 2. What if the length of the question requires line breaks?
  // TODO: remove
  questions = [...questions, ...questions, ...questions, ...questions];

  return (
    <div className="top-questions-layout">
      <header className="header">
        <h2 className="header-title">
          Top Questions{" "}
          <span className="question-count">
            ({questions.length ?? "Loading..."})
          </span>
        </h2>
      </header>
      <main className="content">
        <ol>
          {questions.map((question) => (
            <li key={question.uid} className="bubble">
              <h2 as="h2" color="white" size="sm" mb={2}>
                {question.question}
              </h2>
              <div>Hello! How can I improve my programming skills?</div>
              <div className="upvote-section">
                <div className="upvote-count">5</div>
                <div dangerouslySetInnerHTML={{ __html: ArrowUpIcon }} />
              </div>
            </li>
          ))}
        </ol>
      </main>
      <footer className="footer">
        <h2 as="h1" color="white" size="md" mb={1.5}>
          Attendees <span className="question-count">(121)</span>
        </h2>
        <h2 as="h1" color="white" size="md" mb={1.5}>
          Votes <span className="question-count">(53)</span>
        </h2>
      </footer>
    </div>
  );
};

export default TopQuestions;
