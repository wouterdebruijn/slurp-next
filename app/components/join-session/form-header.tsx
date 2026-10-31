import { Pumpkin } from "../halloween/spooky-art";

export function FormHeader() {
  return (
    <div className="text-center mb-8">
      <Pumpkin className="size-24 mx-auto mb-4" />
      <h1 className="font-spooky text-5xl tracking-wide text-bone mb-3">
        Welcome to{" "}
        <span className="font-bloody text-4xl text-blood block mt-3 text-glow-pumpkin">
          Slurp!
        </span>
      </h1>
      <p className="text-mist">
        Join the séance and raise a glass&hellip;{" "}
        <span className="whitespace-nowrap">if you dare! 🦇</span>
      </p>
    </div>
  );
}
