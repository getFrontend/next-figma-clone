import { useMyPresence, useOthers } from "@/liveblocks.config";
import LiveCursors from "./cursor/LiveCursors";
import { CursorMode, Reaction } from "@/types/type";
import { useCallback, useEffect, useState } from "react";
import ScreenFitText from "./ScreenFitText";
import CursorChat from "./cursor/CursorChat";
import ReactionSelector from "./reaction/ReactionButton";

const Live = () => {
  // useOthers returns the list of other users in the room.
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence() as any;

  const [cursorState, setCursorState] = useState({
    mode: CursorMode.Hidden
  });

  const [reactions, setReactions] = useState<Reaction[]>([]);

  // Listen to keyboard events to change the cursor state
  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (e.key === "Escape") {
        updateMyPresence({ message: "" });
        setCursorState({ mode: CursorMode.Hidden });
      } else if (e.key === "e") {
        setCursorState({ mode: CursorMode.ReactionSelector });
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);

  // Listen to mouse events to change the cursor state
  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();

    if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
      // get the cursor position in the canvas
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
      // broadcast the cursor position to other users
      updateMyPresence({ cursor: { x, y } });
    };
  }, []);

  // Hide the cursor when the mouse leaves the canvas
  const handlePointerLeave = useCallback(() => {
    setCursorState({
      mode: CursorMode.Hidden,
    });

    updateMyPresence({
      cursor: null,
      message: null,
    });
  }, []);

  const handlePointerUp = () => {

  }

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

    updateMyPresence({ cursor: { x, y } });

    setCursorState((state: CursorState) => {
      cursorState.mode === CursorMode.Reaction ?
        { ...state, isPressed: true } :
        state
    });
  }, []);

  return (
    <div className="z-10 w-full h-[100vh] flex justify-center items-center text-center"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
    // onPointerUp={handlePointerUp}
    >
      <h1 className="sr-only text-white">Figman - a minimalist clone of Figma</h1>
      <ScreenFitText />

      {/* If cursor is in chat mode, show the chat cursor */}
      {cursor && (
        <CursorChat
          cursor={cursor}
          cursorState={cursorState}
          setCursorState={setCursorState}
          updateMyPresence={updateMyPresence}
        />
      )}

      {cursorState.mode === CursorMode.ReactionSelector && (
        <ReactionSelector
          setReaction={(reaction) => {
            setReactions(reaction);
          }}

        />
      )}

      {/* Show the live cursors of other users */}
      <LiveCursors others={others} />
    </div>
  );
};

export default Live;