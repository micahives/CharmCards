import { SVGProps } from "react"
const OpenBlankCard = (props: SVGProps<SVGSVGElement>) => (
  <svg
    // Leave viewBox as-is but exclude width/height so SVG fits 100% in parent container
    // width={518}
    // height={420}
    viewBox="0 0 518 420"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="openCard">
      <g id="openRight">
        <line
          id="rightLine"
          x1={516.5}
          y1={0.998807}
          x2={517.5}
          y2={419.999}
          stroke="black"
        />
        <line
          id="topRightLine"
          x1={258.971}
          y1={15.5008}
          x2={516.971}
          y2={0.500843}
          stroke="black"
        />
        <line
          id="bottomRightLine"
          x1={258.065}
          y1={385.504}
          x2={517.065}
          y2={419.504}
          stroke="black"
        />
      </g>
      <g id="openLeft">
        <line
          id="middleLine"
          x1={259.5}
          y1={16.0014}
          x2={258.5}
          y2={386.001}
          stroke="black"
        />
        <line
          id="bottomLeftLine"
          x1={0.934673}
          y1={419.504}
          x2={258.935}
          y2={385.504}
          stroke="black"
        />
        <line
          id="topLeftLine"
          x1={0.0289091}
          y1={0.500836}
          x2={259.029}
          y2={15.5008}
          stroke="black"
        />
        <line
          id="leftLine"
          x1={0.499999}
          y1={0.998807}
          x2={1.5}
          y2={419.999}
          stroke="black"
        />
      </g>
    </g>
  </svg>
)
export { OpenBlankCard }
