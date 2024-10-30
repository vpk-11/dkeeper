import List "mo:base/List";
import Debug "mo:base/Debug";

actor DKeeper {
	public type Note = {
		title: Text;
		content: Text;
	};
	stable var notes: List.List<Note> = List.nil<Note>(); // List object -> List of Notes (array of notes)
	// List adds element to start of the list
	
	// Create Function
	public func createNote(titleText: Text, contentText: Text){
		let newNote: Note = {
			title = titleText;
			content = contentText;
		};
		notes := List.push(newNote, notes);
		// Debug.print(debug_show(notes));
	};

	// Read Notes
	public query func readNotes(): async [Note] {
		return List.toArray(notes);
	};

	// Delete Notes
	public func removeNote(id: Nat){
		// motoko doesnt have a remove element / delete element function
		// take drop append
		let listFront = List.take(notes, id);
		let listBack = List.drop(notes, id + 1);
		
		notes := List.append(listFront, listBack);
	};
};
