"use client";
import { useMemo, useState } from "react";
import Protected from "../components/Protected";
import { add, list, remove, update } from "../lib/db";
import type { LibraryBook } from "../lib/types";

export default function LibraryPage() {
  const initial = useMemo(()=> list("library") as LibraryBook[], []);
  const [items, setItems] = useState<LibraryBook[]>(initial);
  const [title, setTitle] = useState("");
  const [isbn, setIsbn] = useState("");
  const [author, setAuthor] = useState("");

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !isbn) return;
    const created = add("library", { title, isbn, author, available: true });
    setItems(prev=>[...prev, created as LibraryBook]);
    setTitle(""); setIsbn(""); setAuthor("");
  };

  const onDelete = (id: string) => {
    remove("library", id);
    setItems(prev=>prev.filter(b=>b.id!==id));
  };

  const toggleAvail = (id: string, available: boolean) => {
    const upd = update("library", id, { available: !available }) as LibraryBook | null;
    if (upd) setItems(prev=>prev.map(b=> b.id===id? upd: b));
  };

  return (
    <Protected roles={["SUPER_ADMIN","ADMIN_INVENTORY"]}>
      <div style={{padding:20}}>
        <h1>Library</h1>
        <form onSubmit={onAdd} style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:8, alignItems:"end", marginTop:12}}>
          <label>Title<input value={title} onChange={(e)=>setTitle(e.target.value)} /></label>
          <label>ISBN<input value={isbn} onChange={(e)=>setIsbn(e.target.value)} /></label>
          <label>Author<input value={author} onChange={(e)=>setAuthor(e.target.value)} /></label>
          <button type="submit">Add</button>
        </form>
        <table style={{width:"100%", marginTop:16, borderCollapse:"collapse"}}>
          <thead><tr><th align="left">Title</th><th align="left">ISBN</th><th align="left">Author</th><th align="left">Available</th><th></th></tr></thead>
          <tbody>
            {items.map(b=> (
              <tr key={b.id} style={{borderTop:"1px solid #eee"}}>
                <td>{b.title}</td>
                <td>{b.isbn}</td>
                <td>{b.author}</td>
                <td>{b.available?"Yes":"No"}</td>
                <td style={{display:"flex", gap:6}}>
                  <button onClick={()=>toggleAvail(b.id, b.available)}>{b.available?"Issue":"Return"}</button>
                  <button onClick={()=>onDelete(b.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Protected>
  );
}
