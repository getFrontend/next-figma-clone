"use client";

import LeftSidebar from "@/components/LeftSidebar";
import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import RightSidebar from "@/components/RightSidebar";
import ScreenFitText from "@/components/ScreenFitText";
import { useEffect, useRef } from "react";
import { fabric } from "fabric";
import { handleCanvasMouseDown, handleResize, initializeFabric } from "@/lib/canvas";

export default function Page() {
  // canvasRef is a reference to the canvas element that we'll use to initialize the fabric canvas.
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /** fabricRef is a reference to the fabric canvas that we use to perform
   * operations on the canvas. It's a copy of the created canvas so we can use
   * it outside the canvas event listeners.
   */
  const fabricRef = useRef<fabric.Canvas | null>(null);

  /**
   * isDrawing is a boolean that tells us if the user is drawing on the canvas.
   * We use this to determine if the user is drawing or not
   * i.e., if the freeform drawing mode is on or not.
   */
  const isDrawing = useRef(false);

  // shapeRef is a reference to the shape that the user is currently drawing.
  const shapeRef = useRef<fabric.Object | null>(null);

  // selectedShapeRef is a reference to the shape that the user has selected.
  const selectedShapeRef = useRef<string | null>("rectangle");

  useEffect(() => {
    // initialize the fabric canvas
    const canvas = initializeFabric({ canvasRef, fabricRef });

    /**
     * listen to the mouse down event on the canvas which is fired when the
     * user clicks on the canvas
     *
     * Event inspector: http://fabricjs.com/events
     * Event list: http://fabricjs.com/docs/fabric.Canvas.html#fire
     */
    canvas.on("mouse:down", (options) => {
      handleCanvasMouseDown({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef
      });
    });

    window.addEventListener("resize", () => {
      handleResize({
        canvas: fabricRef.current,
      });
    });
  }, []);

  return (
    <main className="h-screen overflow-hidden">
      <Navbar />
      <section className="flex flex-row h-full">
        <h1 className="sr-only text-white">Figman - a minimalist clone of Figma</h1>
        <LeftSidebar />
        <Live canvasRef={canvasRef} />
        <RightSidebar />
      </section>
      <ScreenFitText />
    </main>
  );
}