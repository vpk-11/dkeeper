import { Trash2 } from "lucide-react";

interface NoteProps {
  id: bigint;
  title: string;
  content: string;
  onDelete: (id: bigint) => void;
}

function Note({ id, title, content, onDelete }: NoteProps) {
  return (
    <div className="note">
      <h1>{title}</h1>
      <p>{content}</p>
      <button onClick={() => onDelete(id)} aria-label="Delete note">
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default Note;
