import { useMyPresence, useOthers } from "@/liveblocks.config";
import LiveCursors from "./cursor/LiveCursors";
import { CursorMode } from "@/types/type";
import { useCallback } from "react";

const Live = () => {
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence() as any;

  // Listen to mouse events to change the cursor state
  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();

    // get the cursor position in the canvas
    const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

    // broadcast the cursor position to other users
    updateMyPresence({ cursor: { x, y } });
  }, []);

  // Hide the cursor when the mouse leaves the canvas
  const handlePointerLeave = useCallback(() => {
    updateMyPresence({
      cursor: null,
      message: null,
    });
  }, []);


  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

    updateMyPresence({ cursor: { x, y } });
  }, []);

  return (
    <div className="w-full h-[100vh] flex justify-center items-center text-center"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
    // onPointerUp={handlePointerUp}
    >
      <h1 className="text-2xl text-white">Фигма</h1>
      <LiveCursors others={others} />
    </div>
  )
};

export default Live;