"use client";

import t from "./tools.module.css";

/** "Jump to a state": scrolls to that state's section on the same page. */
export function StateJump({ states }: { states: { id: string; label: string }[] }) {
  return (
    <div className={t.jumpSel}>
      <label htmlFor="state-jump">Jump to a state</label>
      <select
        id="state-jump"
        defaultValue=""
        onChange={(e) => {
          const id = e.target.value;
          if (!id) return;
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          window.history.replaceState(window.history.state, "", `#${id}`);
        }}
      >
        <option value="">All states</option>
        {states.map((x) => (
          <option key={x.id} value={x.id}>
            {x.label}
          </option>
        ))}
      </select>
    </div>
  );
}
