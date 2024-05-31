import { SVGProps } from "react";
import { motion } from "framer-motion";

const OpenBlankCardSvg = (props: SVGProps<SVGSVGElement>) => {

  return (
      <svg
        // Exclude width and height for resizability 
        // width={518}
        // height={420}
        // 50 px buffer added around the SVG to avoid SVG being clipped during animation
        viewBox="-50 -50 618 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <motion.g 
          id="openCard"
          whileHover={{
            scale: 1.01,
            transition: { duration: 0.2 },
          }}
          >

        {/* Invisible rectangle to capture hover events */}
        <rect
          x="0"
          y="0"
          width="618"
          height="520"
          fill="transparent"
        />
          <g id="openRight">
            <line
              id="rightLine"
              x1={516.5}
              y1={0.998807}
              x2={517.5}
              y2={419.999}
              stroke="black"
              strokeWidth={1.5}
            />
            <line
              id="topRightLine"
              x1={258.971}
              y1={15.5008}
              x2={516.971}
              y2={0.500843}
              stroke="black"
              strokeWidth={1.5}
            />
            <line
              id="bottomRightLine"
              x1={258.065}
              y1={385.504}
              x2={517.065}
              y2={419.504}
              stroke="black"
              strokeWidth={1.5}
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
              strokeWidth={2}
            />
            <line
              id="bottomLeftLine"
              x1={0.934673}
              y1={419.504}
              x2={258.935}
              y2={385.504}
              stroke="black"
              strokeWidth={1.5}
            />
            <line
              id="topLeftLine"
              x1={0.0289091}
              y1={0.500836}
              x2={259.029}
              y2={15.5008}
              stroke="black"
              strokeWidth={1.5}
            />
            <line
              id="leftLine"
              x1={0.499999}
              y1={0.998807}
              x2={1.5}
              y2={419.999}
              stroke="black"
              strokeWidth={1.5}
            />
          </g>
        </motion.g>
      </svg>
)
}

export { OpenBlankCardSvg };