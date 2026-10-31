import { Flame, WoodenCross, Zombie } from "./spooky-art";

const ZOMBIES = [
  { size: "h-[6.5vh]", duration: "58s", delay: "-6s", lurch: "1.4s" },
  { size: "h-[5vh]", duration: "77s", delay: "-40s", lurch: "1.1s" },
  { size: "h-[6vh]", duration: "66s", delay: "-25s", lurch: "1.7s" },
];

// Fire climbs the post and licks the tips of the crossbar, leaving the shape readable
const FLAMES = [
  {
    box: "left-[0.3vh] bottom-0 h-[6.5vh] w-[5vh]",
    duration: "0.9s",
    delay: "0s",
  },
  {
    box: "left-[1.2vh] bottom-[1.5vh] h-[6vh] w-[3.5vh]",
    duration: "0.7s",
    delay: "-0.3s",
  },
  {
    box: "left-[1.6vh] bottom-[0.5vh] h-[4vh] w-[2.6vh]",
    duration: "0.6s",
    delay: "-0.2s",
  },
  {
    box: "left-[-0.4vh] bottom-[8.2vh] h-[2.6vh] w-[1.8vh]",
    duration: "0.65s",
    delay: "-0.4s",
  },
  {
    box: "left-[4.2vh] bottom-[8.2vh] h-[2.4vh] w-[1.6vh]",
    duration: "0.75s",
    delay: "-0.1s",
  },
];

const EMBERS = [
  { left: "1.5vh", dx: "-2vh", duration: "1.8s", delay: "0s" },
  { left: "3vh", dx: "1.5vh", duration: "2.2s", delay: "-0.6s" },
  { left: "2.2vh", dx: "-0.5vh", duration: "1.6s", delay: "-1.1s" },
  { left: "4vh", dx: "2.5vh", duration: "2.4s", delay: "-1.6s" },
  { left: "0.5vh", dx: "-1.5vh", duration: "2s", delay: "-0.9s" },
];

/**
 * A zombie holds a torch to a burning grave cross in the bottom-left margin.
 * Flames, glow and embers only animate transform/opacity.
 */
function BurningCross() {
  return (
    <div className="absolute bottom-0 left-[1.5vh] h-full w-[14vh]">
      <div
        className="animate-fire-glow absolute -left-[8vh] -bottom-[6vh] size-[22vh] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgb(255 122 24 / 0.45), rgb(211 18 42 / 0.15) 60%, transparent)",
        }}
      />
      <WoodenCross className="absolute bottom-0 left-0 h-[11vh] w-[5.5vh]" />
      {FLAMES.map((flame) => (
        <div
          key={flame.box}
          className={`animate-flame-flicker absolute origin-bottom ${flame.box}`}
          style={{
            animationDuration: flame.duration,
            animationDelay: flame.delay,
          }}
        >
          <Flame className="size-full" />
        </div>
      ))}
      {EMBERS.map((ember) => (
        <span
          key={ember.left + ember.delay}
          className="animate-ember-rise absolute bottom-[9vh] size-1 rounded-full bg-[#ffb454] shadow-[0_0_6px_2px_#ff7a18]"
          style={
            {
              left: ember.left,
              "--dx": ember.dx,
              animationDuration: ember.duration,
              animationDelay: ember.delay,
            } as React.CSSProperties
          }
        />
      ))}
      {/* Torch-bearer, facing the cross */}
      <div className="absolute bottom-0 left-[7vh]">
        <div className="animate-zombie-lurch origin-bottom [animation-duration:2.2s]">
          <div className="relative -scale-x-100">
            <Zombie className="h-[6.5vh] w-auto" />
            <div className="absolute left-[88%] top-[4%] h-[3vh] w-[0.5vh] rotate-[25deg] rounded-sm bg-[#4a2e1a]">
              <div className="animate-flame-flicker absolute -top-[2vh] -left-[0.6vh] h-[2.4vh] w-[1.7vh] origin-bottom [animation-duration:0.5s]">
                <Flame className="size-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A few zombies shamble along the bottom-left edge, in front of the page.
 * Wide screens only, so they never cover a phone's join form.
 */
export default function ZombieHorde() {
  return (
    <div
      className="spooky-scene hidden lg:block fixed bottom-0 left-0 z-40 w-[40vw] h-[18vh] overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <BurningCross />
      {ZOMBIES.map((zombie) => (
        <div
          key={zombie.duration}
          className="animate-zombie-walk absolute bottom-0 left-0"
          style={{
            animationDuration: zombie.duration,
            animationDelay: zombie.delay,
          }}
        >
          <div
            className="animate-zombie-lurch origin-bottom"
            style={{ animationDuration: zombie.lurch }}
          >
            <Zombie className={`${zombie.size} w-auto`} />
          </div>
        </div>
      ))}
    </div>
  );
}
