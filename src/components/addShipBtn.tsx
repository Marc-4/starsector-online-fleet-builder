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
        className={`w-full hover:border-cyan-200 border-transparent border h-24 min-h-24 sm:h-28 lg:h-63 lg:max-2xl:h-57.5 lg:max-xl:h-47.75
          lg:max-lg:h-38.25 shrink-0 text-2xl font-bold cursor-pointer touch-manipulation text-cyan-200`}
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
