import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

const SvgLoader = () => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-20 w-20 stroke-neutral-500 dark:stroke-neutral-100"
  >
    <motion.path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <motion.path
      initial={{ pathLength: 0, fill: "#fefefe" }}
      animate={{ pathLength: 1, fill: "#ffe066" }}
      transition={{
        duration: 0.8, // Faster animation
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
      }}
      d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11"
    />
  </motion.svg>
);

const Loading = () => {
  const { nextUrl } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (nextUrl) {
      setTimeout(() => {
        navigate("/" + nextUrl);
      }, 8000);
    }
  }, [navigate, nextUrl]);

  return (
    <div className="flex justify-center items-center h-[100vh]">
      <SvgLoader />
    </div>
  );
};

export default Loading;
