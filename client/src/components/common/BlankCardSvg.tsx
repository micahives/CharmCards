import { SVGProps } from "react";
import { motion } from "framer-motion";

const BlankCardSvg = (props: SVGProps<SVGSVGElement>) => {

  return (
    <svg
    // Leave viewBox as-is but exclude width/height so SVG fits 100% in parent container
    // width={295}
    // height={412}
    viewBox="0 0 295 412"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <motion.g 
      id="blankCard"
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      >
      <g id="frontCard">
        <path
          id="frontFace"
          d="M276.077 35.9193H17.0568V398.94H276.077V35.9193Z"
          fill="white"
          stroke="black"
          strokeWidth={1.14352}
        />
        <g id="frontTop">
          <path
            d="M259.685 34.0853C259.685 13.5143 258.786 13 258.786 13L17 35.1138"
            fill="white"
          />
          <path
            d="M259.685 34.0853C259.685 13.5143 258.786 13 258.786 13L17 35.1138"
            stroke="black"
            strokeWidth={1.14352}
          />
        </g>
      </g>
    </motion.g>
    </svg>
  )
};

export { BlankCardSvg };