import { useEffect, useState } from "react";
import { faker } from "@faker-js/faker";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

// For demo purposes. In a real app, you'd have real user data.
const NAME = getOrSetFakeName();

export default function App() {
  const sendMessage = useMutation(api.chat.sendMessage);

  const messages = useQuery(api.chat.getMessages);


  const [newMessageText, setNewMessageText] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    // Make sure scrollTo works on button click in Chrome
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 0);
  }, [messages]);

  return (
    <main className="chat">
      <header>
        <h1>Convex Chat</h1>
        <p>
          Connected as <strong>{NAME}</strong>
        </p>
        {sendError ? (
          <p className="chat-error" role="alert">
            {sendError}
          </p>
        ) : null}
      </header>
      {messages?.map((message) => (
        <article
          key={message._id}
          className={message.user === NAME ? "message-mine" : ""}
        >
          <div>{message.user}</div>
          <div>{message.poop}</div>
          <p>{message.body}</p>
        </article>
      ))}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSendError(null);
          try {
            await sendMessage({ user: NAME, body: newMessageText, poop: faker.animal.dog() });
            setNewMessageText("");
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Could not send message.";
            setSendError(message);
          }
        }}
      >
        <input
          value={newMessageText}
          onChange={async (e) => {
            const text = e.target.value;
            setNewMessageText(text);
          }}
          placeholder="Write a message…"
          autoFocus
        />
        <button type="submit" disabled={!newMessageText}>
          Send
        </button>
      </form>
    </main>
  );
}

function getOrSetFakeName() {
  const NAME_KEY = "tutorial_name";
  const name = sessionStorage.getItem(NAME_KEY);
  if (!name) {
    const newName = faker.person.firstName();
    sessionStorage.setItem(NAME_KEY, newName);
    return newName;
  }
  return name;
}
