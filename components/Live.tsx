import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from "@/liveblocks.config";
import LiveCursors from "./cursor/LiveCursors";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import { useCallback, useEffect, useState } from "react";
import ScreenFitText from "./ScreenFitText";
import CursorChat from "./cursor/CursorChat";
import ReactionSelector from "./reaction/ReactionButton";
import FlyingReaction from "./reaction/FlyingReaction";
import useInterval from "@/hooks/useInterval";

const Live = () => {
  // useOthers returns the list of other users in the room.
  const others = useOthers();

  /** useMyPresence returns the presence of the current user in the room.
  * It also returns a function to update the presence of the current user.
  * useMyPresence: https://liveblocks.io/docs/api-reference/liveblocks-react#useMyPresence
  */
  const [{ cursor }, updateMyPresence] = useMyPresence() as any;

  // track the state of the cursor (hidden, chat, reaction, reaction selector)
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });

  // store the reactions created on mouse click
  const [reactions, setReactions] = useState<Reaction[]>([]);

  /**
  * useBroadcastEvent is used to broadcast an event to all the other users in the room.
  * useBroadcastEvent: https://liveblocks.io/docs/api-reference/liveblocks-react#useBroadcastEvent
  */
  const broadcast = useBroadcastEvent();

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

  // Remove reactions that are not visible anymore (every 1 sec)
  useInterval(() => {
    setReactions((reactions) => reactions.filter((reaction) => reaction.timestamp > Date.now() - 3000));
  }, 1000);

  // Broadcast the reaction to other users (every 100ms)
  useInterval(() => {
    if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
      // concat all the reactions created on mouse click
      setReactions((reactions) =>
        reactions.concat([
          {
            point: { x: cursor.x, y: cursor.y },
            value: cursorState.reaction,
            timestamp: Date.now(),
          },
        ])
      );

      // Broadcast the reaction to other users
      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    };
  }, 100);

  /**
   * useEventListener is used to listen to events broadcasted by other users.
   * useEventListener: https://liveblocks.io/docs/api-reference/liveblocks-react#useEventListener
   */
  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;
    setReactions((reactions) =>
      reactions.concat([
        {
          point: { x: event.x, y: event.y },
          value: event.value,
          timestamp: Date.now(),
        },
      ])
    );
  });

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

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    setCursorState((state: CursorState) =>
      cursorState.mode === CursorMode.Reaction ?
        { ...state, isPressed: false } :
        state
    );
  }, [cursorState.mode, setCursorState]);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

    updateMyPresence({ cursor: { x, y } });

    // if cursor is in reaction mode, set isPressed to true
    setCursorState((state: CursorState) =>
      cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
    );
  }, [cursorState.mode, setCursorState]);

  // set the reaction of the cursor
  const setReaction = useCallback((reaction: string) => {
    setCursorState({
      mode: CursorMode.Reaction,
      reaction,
      isPressed: false
    });
  }, []);

  return (
    <div className="z-10 w-full h-[100vh] flex justify-center items-center text-center"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <h1 className="sr-only text-white">Figman - a minimalist clone of Figma</h1>
      <ScreenFitText />

      {reactions.map((reaction) => (
        <FlyingReaction
          key={reaction.timestamp.toString()}
          x={reaction.point.x}
          y={reaction.point.y}
          timestamp={reaction.timestamp}
          value={reaction.value}
        />
      )
      )}

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
            setReaction(reaction);
          }}
        />
      )}

      {/* Show the live cursors of other users */}
      <LiveCursors others={others} />
    </div>
  );
};

export default Live;