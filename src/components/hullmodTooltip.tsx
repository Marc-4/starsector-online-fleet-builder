import {
  describeHullmod,
  describeHullmodSMod,
  getHullmodTables
} from "#/hullModData"
import { highlightNumbers } from "#/lib/textColoring"
import type { hullMod } from "#/types"

export default function HullmodTooltip({ hullmod }: { hullmod: hullMod }) {
  const sModText = describeHullmodSMod(hullmod) ?? hullmod.sModDesc
  const tables = getHullmodTables(hullmod)
  return (
    <div className="flex w-full font-serif flex-col gap-1 border border-cyan-200 bg-gray-950 p-2 text-lg">
      <p className="text-cyan-200">{hullmod.name}</p>
      {hullmod.desc && (
        <p className="whitespace-pre-line leading-tight text-md text-cyan-50/90">
          {highlightNumbers(describeHullmod(hullmod))}
        </p>
      )}
      {tables.map((table, ti) => (
        <div key={ti} className="flex flex-col gap-0.5">
          {table.caption && (
            <p className="leading-tight text-md text-cyan-50/90">
              {table.caption}
            </p>
          )}
          <table className="w-fit text-md leading-tight">
            <thead>
              <tr className="text-cyan-200">
                {table.head.map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-2 py-0.5 text-left font-normal border-b border-cyan-800"
                  >
                    {highlightNumbers(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-cyan-50/90">
              {table.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-2 py-0.5 whitespace-nowrap">
                      {highlightNumbers(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      {sModText && (
        <>
          <p className="bg-lime-900/60 py-0.5 text-center text-md text-lime-200">
            S-mod bonus
          </p>
          <p className="whitespace-pre-line text-md leading-tight text-cyan-100/90">
            {highlightNumbers(sModText)}
          </p>
        </>
      )}
    </div>
  )
}
