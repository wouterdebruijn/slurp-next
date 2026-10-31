import { Zombie } from "./spooky-art";

const ZOMBIES = [
  { size: "h-[6.5vh]", duration: "58s", delay: "-6s", lurch: "1.4s" },
  { size: "h-[5vh]", duration: "77s", delay: "-40s", lurch: "1.1s" },
  { size: "h-[6vh]", duration: "66s", delay: "-25s", lurch: "1.7s" },
];

/**
 * A few zombies shamble along the bottom-left edge, in front of the page.
 * Wide screens only, so they never cover a phone's join form.
 */
export default function ZombieHorde() {
  return (
    <div
      className="spooky-scene hidden lg:block fixed bottom-0 left-0 z-40 w-[40vw] h-[10vh] overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
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
