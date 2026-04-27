import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { IconEdit } from "../icons/Icons";

export default function EditableText({
  value,
  onSave,
  className = "",
  tag: Tag = "p",
}) {
  const { user } = useAuth();
  const isAdmin = user?.tipo === 1;

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);

  const ref = useRef(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  function save() {
    setEditing(false);

    const trimmed = ref.current?.innerText.trim();

    if (!trimmed) {
      setText(value);
      return;
    }

    setText(trimmed);

    if (trimmed !== value) {
      onSave(trimmed);
    }
  }

  return (
    <Tag className={`editable-text ${className}`}>
      <div className="editable-wrapper">
        <div
          ref={ref}
          className={`editable-content ${editing ? "editing" : ""}`}
          contentEditable={editing && isAdmin}
          suppressContentEditableWarning={true}
          onInput={(e) => setText(e.currentTarget.innerText)}
          onBlur={save}
        >
          {text}
        </div>
      </div>
    </Tag>
  );
}
