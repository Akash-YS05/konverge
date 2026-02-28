"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
type IntegrationApp = {
  name: string;
  logo: string;
};
type IntegrationCarouselProps = {
  buttonText?: string;
  buttonHref?: string;
  title?: string;
  subtitle?: string;
  topRowApps?: IntegrationApp[];
  bottomRowApps?: IntegrationApp[];
};
const defaultTopRowApps: IntegrationApp[] = [
  {
    name: "VS Code",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg",
  },
  {
    name: "GitHub",
    logo: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
  },
  {
    name: "Slack",
    logo: "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png",
  },
  {
    name: "GitLab",
    logo: "https://about.gitlab.com/images/press/press-kit-icon-dark.svg",
  },
  {
    name: "Bitbucket",
    logo: "https://wac-cdn.atlassian.com/assets/img/favicons/bitbucket/favicon.ico",
  },
  {
    name: "Jira",
    logo: "https://wac-cdn.atlassian.com/assets/img/favicons/jira/favicon.ico",
  },
  {
    name: "Figma",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg",
  },
  {
    name: "Notion",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg",
  },
];
const defaultBottomRowApps: IntegrationApp[] = [
  {
    name: "Docker",
    logo: "https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png",
  },
  {
    name: "AWS",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
  },
  {
    name: "Vercel",
    logo: "https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png",
  },
  {
    name: "Netlify",
    logo: "https://www.netlify.com/v3/img/components/logomark.svg",
  },
  {
    name: "React",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
  },
  {
    name: "Node.js",
    logo: "https://nodejs.org/static/images/logo.svg",
  },
  {
    name: "TypeScript",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg",
  },
  {
    name: "Next.js",
    logo: "https://nextjs.org/favicon.ico",
  },
];

// @component: IntegrationCarousel
export const IntegrationCarousel = ({
  buttonText = "Explore Integrations",
  buttonHref = "#",
  title = "Works with your favorite development tools.",
  subtitle = "Connect DevRoom to VS Code, GitHub, Slack, and more — get AI assistance directly in your workflow.",
  topRowApps = defaultTopRowApps,
  bottomRowApps = defaultBottomRowApps,
}: IntegrationCarouselProps) => {
  const topRowRef = useRef<HTMLDivElement>(null);
  const bottomRowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let topAnimationId: number;
    let bottomAnimationId: number;
    let topPosition = 0;
    let bottomPosition = 0;
    const animateTopRow = () => {
      if (topRowRef.current) {
        topPosition -= 0.5;
        if (Math.abs(topPosition) >= topRowRef.current.scrollWidth / 2) {
          topPosition = 0;
        }
        topRowRef.current.style.transform = `translateX(${topPosition}px)`;
      }
      topAnimationId = requestAnimationFrame(animateTopRow);
    };
    const animateBottomRow = () => {
      if (bottomRowRef.current) {
        bottomPosition -= 0.65;
        if (Math.abs(bottomPosition) >= bottomRowRef.current.scrollWidth / 2) {
          bottomPosition = 0;
        }
        bottomRowRef.current.style.transform = `translateX(${bottomPosition}px)`;
      }
      bottomAnimationId = requestAnimationFrame(animateBottomRow);
    };
    topAnimationId = requestAnimationFrame(animateTopRow);
    bottomAnimationId = requestAnimationFrame(animateBottomRow);
    return () => {
      cancelAnimationFrame(topAnimationId);
      cancelAnimationFrame(bottomAnimationId);
    };
  }, []);

  // @return
  return (
    <div className="w-full py-24 bg-white dark:bg-[#1e1e1e]">
      <div className="max-w-[680px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center mb-20"
        >
          <div className="flex flex-col items-center gap-4">
            <h2
              className="text-[40px] leading-tight font-normal text-[#111A4A] dark:text-white text-center tracking-tight mb-0"
              style={{
                fontFamily: "var(--font-figtree), Figtree",
                fontWeight: "400",
                fontSize: "40px",
              }}
            >
              {title}
            </h2>
            <p
              className="text-lg leading-7 text-[#666666] dark:text-gray-400 text-center max-w-[600px] mt-2"
              style={{
                fontFamily: "var(--font-figtree), Figtree",
              }}
            >
              {subtitle}
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="flex gap-3 mt-6"
          >
            <a
              href={buttonHref}
              className="inline-block px-5 py-2.5 rounded-md bg-white dark:bg-[#3c3c3c] text-[#222222] dark:text-white text-[15px] font-medium leading-6 text-center whitespace-nowrap transition-all duration-75 ease-out w-[182px] cursor-pointer hover:shadow-lg"
              style={{
                boxShadow:
                  "0 -1px 0 0 rgb(181, 181, 181) inset, -1px 0 0 0 rgb(227, 227, 227) inset, 1px 0 0 0 rgb(227, 227, 227) inset, 0 1px 0 0 rgb(227, 227, 227) inset",
                backgroundImage:
                  "linear-gradient(rgba(255, 255, 255, 0.06) 80%, rgba(255, 255, 255, 0.12))",
              }}
            >
              {buttonText}
            </a>
          </motion.div>
        </motion.div>
      </div>

      <div className="h-[268px] -mt-6 mb-0 pb-0 relative overflow-hidden">
        <div
          ref={topRowRef}
          className="flex items-start gap-6 absolute top-6 whitespace-nowrap"
          style={{
            willChange: "transform",
          }}
        >
          {[...topRowApps, ...topRowApps].map((app, index) => (
            <div
              key={`top-${index}`}
              className="flex items-center justify-center w-24 h-24 rounded-md flex-shrink-0 bg-white dark:bg-[#2d2d2d]"
            >
              <img
                src={app.logo || "/placeholder.svg"}
                alt={app.name}
                className="w-9 h-9 block object-contain"
              />
            </div>
          ))}
        </div>

        <div className="absolute top-0 right-0 bottom-0 w-24 h-[268px] z-10 pointer-events-none bg-gradient-to-r from-transparent to-white dark:to-[#1e1e1e]" />

        <div className="absolute top-0 left-0 bottom-0 w-24 h-[268px] z-10 pointer-events-none bg-gradient-to-l from-transparent to-white dark:to-[#1e1e1e]" />

        <div
          ref={bottomRowRef}
          className="flex items-start gap-6 absolute top-[148px] whitespace-nowrap"
          style={{
            willChange: "transform",
          }}
        >
          {[...bottomRowApps, ...bottomRowApps].map((app, index) => (
            <div
              key={`bottom-${index}`}
              className="flex items-center justify-center w-24 h-24 rounded-md flex-shrink-0 bg-white dark:bg-[#2d2d2d]"
            >
              <img
                src={app.logo || "/placeholder.svg"}
                alt={app.name}
                className="w-9 h-9 block object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
