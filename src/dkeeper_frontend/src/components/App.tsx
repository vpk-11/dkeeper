import { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import { dkeeper_backend as dkeeper } from "../../../declarations/dkeeper_backend/index";

interface NoteItem {
  id: bigint;
  title: string;
  content: string;
}

function App() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const notesArray = await dkeeper.readNotes();
      setNotes(notesArray as NoteItem[]);
    } catch (err) {
      setError("Failed to load notes. Is the local replica running?");
    } finally {
      setLoading(false);
    }
  }

  async function addNote(newNote: { title: string; content: string }) {
    const created = await dkeeper.createNote(newNote.title, newNote.content) as NoteItem;
    setNotes((prev) => [created, ...prev]);
  }

  function deleteNote(id: bigint) {
    dkeeper.removeNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div>
      <Header />
      <CreateArea onAdd={addNote} />
      {loading && <p className="status-message">Loading notes...</p>}
      {error && <p className="status-message error">{error}</p>}
      {!loading && !error && notes.length === 0 && (
        <p className="status-message empty">No notes yet. Add one above.</p>
      )}
      <div className="notes-grid">
        {notes.map((noteItem) => (
          <Note
            key={String(noteItem.id)}
            id={noteItem.id}
            title={noteItem.title}
            content={noteItem.content}
            onDelete={deleteNote}
          />
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default App;
