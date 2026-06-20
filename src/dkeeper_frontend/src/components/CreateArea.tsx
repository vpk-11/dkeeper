import { useState } from "react";
import { Plus } from "lucide-react";

interface CreateAreaProps {
  onAdd: (note: { title: string; content: string }) => void;
}

function CreateArea({ onAdd }: CreateAreaProps) {
  const [isExpanded, setExpanded] = useState(false);
  const [note, setNote] = useState({ title: "", content: "" });
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setNote((prev) => ({ ...prev, [name]: value }));
    if (validationError) setValidationError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!note.title.trim() || !note.content.trim()) {
      setValidationError("Title and content are required.");
      return;
    }
    onAdd(note);
    setNote({ title: "", content: "" });
    setExpanded(false);
  }

  return (
    <div>
      <form className="create-note" onSubmit={handleSubmit}>
        {isExpanded && (
          <input
            name="title"
            onChange={handleChange}
            value={note.title}
            placeholder="Title"
          />
        )}
        <textarea
          name="content"
          onClick={() => setExpanded(true)}
          onChange={handleChange}
          value={note.content}
          placeholder="Take a note..."
          rows={isExpanded ? 3 : 1}
        />
        {validationError && (
          <p className="validation-error">{validationError}</p>
        )}
        {isExpanded && (
          <button type="submit" className="add-btn" aria-label="Add note">
            <Plus size={20} />
          </button>
        )}
      </form>
    </div>
  );
}

export default CreateArea;
