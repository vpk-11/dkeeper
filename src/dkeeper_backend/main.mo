import List "mo:base/List";

actor DKeeper {
    public type Note = {
        id: Nat;
        title: Text;
        content: Text;
    };

    stable var notes: List.List<Note> = List.nil<Note>();
    stable var nextId: Nat = 0;

    public func createNote(titleText: Text, contentText: Text) : async Note {
        let newNote: Note = {
            id = nextId;
            title = titleText;
            content = contentText;
        };
        notes := List.push(newNote, notes);
        nextId += 1;
        return newNote;
    };

    public query func readNotes(): async [Note] {
        return List.toArray(notes);
    };

    public func removeNote(id: Nat) {
        notes := List.filter(notes, func(n: Note): Bool { n.id != id });
    };
};
