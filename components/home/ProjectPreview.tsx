export default function ProjectPreview({
  kind,
  wide = false,
}: {
  kind: "architecture" | "platform";
  wide?: boolean;
}) {
  return (
    <div
      className={`[container-type:inline-size] relative grid place-items-center overflow-hidden px-5 pt-[54px] pb-[30px] sm:px-7 sm:pt-[60px] sm:pb-9 ${wide ? "aspect-[1.1] sm:aspect-[1.5] lg:aspect-[2.15] [&>div]:max-w-[840px]" : "aspect-[1.1] sm:aspect-[1.2]"} ${kind === "architecture" ? "bg-[#282d27]" : "bg-[#151c21]"}`}
      aria-hidden="true"
    >
      <span className="absolute top-[21px] left-5 text-[9px] tracking-[0.1em] text-[#eeeee6] sm:left-6 sm:text-[10px]">
        CONCEPT DEMONSTRATIV
      </span>

      {kind === "architecture" ? (
        <div className="w-full -rotate-3 bg-[#e9e6db] p-3.5 text-[#30382b] shadow-[0_22px_50px_#0004] transition-transform duration-500 ease-entrance motion-safe:group-hover/preview:scale-[1.025] motion-safe:group-hover/preview:rotate-0 motion-reduce:transition-none sm:p-[18px]">
          <div className="flex items-center justify-between gap-3 text-[clamp(5px,1.5cqw,9px)] tracking-[0.04em]">
            <span>ARHITECTURĂ / DESIGN</span>
            <span>01 — 03</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 py-[15px] sm:py-[22px]">
            <div className="flex flex-col justify-center gap-[15px] [&>span]:text-[clamp(5px,1.4cqw,8px)] [&>strong]:font-serif [&>strong]:text-[clamp(18px,6cqw,40px)] [&>strong]:leading-none [&>strong]:font-normal [&>strong]:tracking-[-0.04em]">
              <span>SPAȚIU. LUMINĂ. ECHILIBRU.</span>

              <strong>
                Locuri cu
                <br />
                perspectivă.
              </strong>

              <span className="h-0.5 w-[38px] bg-[#30382b]" />
            </div>

            <div className="relative min-h-[132px] overflow-hidden bg-[linear-gradient(160deg,#cbd0c2,#e6e4d8)] sm:min-h-40">
              <div className="absolute bottom-0 left-[8%] h-4/5 w-[56%] -skew-y-12 bg-[repeating-linear-gradient(90deg,#d0cabe_0_5%,#696b5f_5%_7%)]" />
              <div className="absolute right-0 bottom-0 h-[61%] w-[55%] skew-y-12 bg-[repeating-linear-gradient(90deg,#ddd8cc_0_12%,#898d7e_12%_14%)]" />
              <div className="absolute inset-x-0 bottom-0 h-[24%] bg-[linear-gradient(20deg,#52594d99,transparent)]" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-[clamp(5px,1.5cqw,9px)] tracking-[0.04em]">
            <span>O altă perspectivă asupra spațiului.</span>
            <span>↗</span>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[205px] w-full rotate-3 gap-2.5 rounded-[7px] bg-[#e8ecef] p-2.5 text-[#28303b] shadow-[0_24px_50px_#0005] transition-transform duration-500 ease-entrance motion-safe:group-hover/preview:scale-[1.025] motion-safe:group-hover/preview:rotate-0 motion-reduce:transition-none sm:min-h-[225px] sm:gap-3.5 sm:p-[13px]">
          <div className="flex w-[22px] shrink-0 flex-col items-center gap-[17px] border-r border-[#c7cdd2] pr-2.5 [&>i]:size-2.5 [&>i]:rounded-[3px] [&>i]:border [&>i]:border-[#9aa5af]">
            <span className="grid size-5 place-items-center rounded-[5px] bg-[#536e87] text-[#fff]">
              +
            </span>
            <i />
            <i />
            <i />
          </div>

          <div className="min-w-0 flex-1 [&>p]:mt-[5px] [&>p]:mb-3.5 [&>p]:text-[clamp(5px,1.6cqw,9px)] [&>strong]:mt-[18px] [&>strong]:block [&>strong]:text-[clamp(12px,4.4cqw,24px)] [&>strong]:tracking-[-0.05em]">
            <div className="flex items-center justify-between gap-3 text-[clamp(5px,1.5cqw,9px)] tracking-[0.04em]">
              <span>WORKSPACE</span>
              <span>●</span>
            </div>

            <strong>Totul, în perspectivă.</strong>

            <p>Un spațiu pentru ideile care prind formă.</p>

            <div className="grid grid-cols-[1.35fr_1fr] gap-[9px]">
              <div className="rounded-[5px] border border-[#c5cdd5] p-2.5 text-[8px]">
                <span>Activitate</span>

                <div className="flex h-[72px] items-end gap-[5px] pt-3 [&>i]:flex-1 [&>i]:rounded-t-[2px] [&>i]:bg-[#7c96ab]">
                  {[32, 48, 39, 66, 58, 82, 72, 96].map((height, index) => (
                    <i key={index} style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>

              <div className="rounded-[5px] border border-[#c5cdd5] p-2.5 text-[8px] [&>i]:mt-3 [&>i]:block [&>i]:h-[5px] [&>i]:rounded-[3px] [&>i]:bg-[#c2cbd2] [&>i:nth-child(3)]:w-[65%]">
                <span>În lucru</span>
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>

            <div className="mt-3.5 flex justify-between gap-1.5 text-[clamp(5px,1.5cqw,8px)]">
              <span>Design</span>
              <span>Development</span>
              <span>Lansare</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
