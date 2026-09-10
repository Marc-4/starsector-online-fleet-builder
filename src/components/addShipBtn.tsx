import { useState } from "react"
import ShipSelectionModal from "./modals/ShipSelectionModal"

export default function AddShipButton() {
  const [isShipSelectionModalOpen, setIsShipSelectionModalOpen] =
    useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsShipSelectionModalOpen(true)
        }}
        className={`w-full hover:border-cyan-200 border-transparent border h-63 max-2xl:h-57.5 max-xl:h-47.75
          max-lg:h-38.25 max-md:h-28.75 max-sm:h-24 shrink-0 text-2xl font-bold cursor-pointer text-cyan-200`}
      >
        <p className="text-4xl max-md:text-xl">+</p>
        <p>Add Ships</p>
      </button>
      {isShipSelectionModalOpen && (
        <ShipSelectionModal
          onClose={() => setIsShipSelectionModalOpen(false)}
        />
      )}
    </>
  )
}
