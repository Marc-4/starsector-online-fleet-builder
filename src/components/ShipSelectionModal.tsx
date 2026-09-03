export default function ShipSelectionModal({ onClose }: { onClose: any }) {
  return (
    <button
      type="button"
      onClick={() => onClose()}
      className="absolute left-0 top-0 w-screen h-screen z-50"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
        }}
        className="flex flex-col gap-1 absolute left-[10%] top-[10%] z-60 w-[80%] h-[80%] bg-black opacity-60 p-1 border-2 border-y-transparent border-x-cyan-200"
      >
        <button
          type="button"
          onClick={() => onClose()}
          className="relative top-0 ml-auto w-7 h-7 font-bold hover:text-white hover:border-white text-2xl text-cyan-200 flex items-center justify-center border border-t-cyan-100 rounded-sm">
          x
        </button>
        <div className="w-full h-full grid grid-cols-[repeat(auto-fit,13rem)] justify-center gap-2 content-start p-4 overflow-auto">
          {Array.from(Array(24).keys()).map((i) => {
            return (
              <div key={i} className="w-52 shrink-0 h-52 bg-blue-300"></div>
            )
          })}
        </div>
      </button>
    </button>
  )
}
