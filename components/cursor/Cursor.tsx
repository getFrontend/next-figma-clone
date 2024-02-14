import CursorSVG from "@/public/assets/CursorSVG";

type Props = { color: string; x: number; y: number; message: string };

const Cursor = ({ color, x, y, message }: Props) => {
  return (
    <div
      className="absolute top-0 left-0 pointer-events-none"
      style={{ transform: `translateX(${x}px) translateY(${y}px)` }}
    >
      <CursorSVG color={color} />
    </div>
  )
}

export default Cursor