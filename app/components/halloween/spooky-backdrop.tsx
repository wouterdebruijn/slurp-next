import MoonFace from "./moon-face";
import Thunderstorm from "./thunderstorm";
import {
  Bat,
  BloodDrips,
  Ghost,
  Graveyard,
  Moon,
  SpiderWeb,
} from "./spooky-art";

const BATS = [
  {
    top: "12%",
    size: "w-14 lg:w-20",
    duration: "19s",
    delay: "-3s",
    reverse: false,
  },
  {
    top: "28%",
    size: "w-9 lg:w-12",
    duration: "26s",
    delay: "-15s",
    reverse: false,
  },
  {
    top: "9%",
    size: "w-10 lg:w-14",
    duration: "23s",
    delay: "-9s",
    reverse: true,
  },
  {
    top: "44%",
    size: "w-8 lg:w-10",
    duration: "31s",
    delay: "-22s",
    reverse: true,
  },
];

const GHOSTS = [
  {
    top: "24%",
    size: "w-14 lg:w-24",
    duration: "68s",
    delay: "-12s",
    opacity: 0.22,
  },
  {
    top: "58%",
    size: "w-10 lg:w-16",
    duration: "94s",
    delay: "-55s",
    opacity: 0.16,
  },
];

const FALLING_DROPS = [
  { left: "8.5%", delay: "-1s" },
  { left: "45.4%", delay: "-5s" },
  { left: "73.2%", delay: "-7s" },
];

export default function SpookyBackdrop() {
  return (
    <div
      className="spooky-scene spooky-sky fixed inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <div className="spooky-stars animate-twinkle absolute inset-0" />

      <div
        id="moon-home"
        className="absolute left-3 top-3 size-12 md:size-24 lg:left-[5%] lg:top-8 lg:size-52 xl:size-64 rounded-full shadow-[0_0_90px_24px_rgb(255_190_120_/_0.35)]"
      >
        <Moon className="size-full" />
        <MoonFace />
      </div>

      <SpiderWeb className="absolute top-0 right-0 size-32 lg:size-80 opacity-30 -scale-x-100" />
      <SpiderWeb className="absolute top-0 left-0 size-24 lg:size-64 opacity-25" />

      {BATS.map((bat) => (
        <div
          key={`${bat.top}-${bat.duration}`}
          className="animate-bat-fly absolute left-0"
          style={{
            top: bat.top,
            animationDuration: bat.duration,
            animationDelay: bat.delay,
            animationDirection: bat.reverse ? "reverse" : "normal",
          }}
        >
          <div className={bat.reverse ? "-scale-x-100" : undefined}>
            <Bat className={`animate-bat-flap ${bat.size}`} />
          </div>
        </div>
      ))}

      {GHOSTS.map((ghost) => (
        <div
          key={ghost.top}
          className="animate-ghost-drift absolute left-0"
          style={{
            top: ghost.top,
            opacity: ghost.opacity,
            animationDuration: ghost.duration,
            animationDelay: ghost.delay,
          }}
        >
          <Ghost className={`animate-ghost-float ${ghost.size}`} />
        </div>
      ))}

      <Graveyard className="absolute bottom-0 right-0 w-full min-w-[800px]" />

      <div className="spooky-fog animate-fog-drift absolute bottom-0 left-0 h-1/3 w-[200%] [animation-duration:70s]" />
      <div className="spooky-fog animate-fog-drift absolute bottom-0 left-0 h-1/4 w-[200%] [animation-direction:reverse] [animation-duration:110s]" />

      <BloodDrips className="absolute inset-x-0 top-0 w-full h-8 lg:h-16" />
      {FALLING_DROPS.map((drop) => (
        <div
          key={drop.left}
          className="hidden lg:block animate-drip-fall absolute top-12 w-1.5 h-3 rounded-b-full bg-[#8f0b1c]"
          style={{ left: drop.left, animationDelay: drop.delay }}
        />
      ))}

      <Thunderstorm />
    </div>
  );
}
