import { RightSidebarProps } from "@/types/type";
import Color from "./settings/Color";
import Dimensions from "./settings/Dimensions";
import Export from "./settings/Export";
import Text from "./settings/Text";
import { useRef } from "react";
import { modifyShape } from "@/lib/shapes";

const RightSidebar = ({
  elementAttributes,
  setElementAttributes,
  fabricRef,
  activeObjectRef,
  isEditingRef,
  syncShapeInStorage,
}: RightSidebarProps) => {
  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);

  const handleInputChange = (property: string, value: string) => {
    if (!isEditingRef.current) isEditingRef.current = true;

    setElementAttributes((prev) => ({ ...prev, [property]: value }));

    modifyShape({
      canvas: fabricRef.current as fabric.Canvas,
      property,
      value,
      activeObjectRef,
      syncShapeInStorage
    });
  };

  return (
    <section className=" h-full sticky right-0 pb-20 flex flex-col select-none overflow-y-auto border-t border-primary-grey-200 bg-primary-black text-primary-grey-300 max-sm:hidden min-w-[227px]">
      <h2 className="border border-primary-grey-200 px-5 py-4 text-xs uppercase">Design</h2>
      <span className="text-xs text-primary-grey-300 px-5 py-4 border-b border-primary-grey-200">
        Make any changes you want to the canvas
      </span>

      <Dimensions
        width={elementAttributes.width}
        height={elementAttributes.height}
        handleInputChange={handleInputChange}
        isEditingRef={isEditingRef}
      />
      <Text />
      <Color />
      <Color />
      <Export />
    </section>
  )
};

export default RightSidebar;