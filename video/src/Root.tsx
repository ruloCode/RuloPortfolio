import { Composition } from "remotion";
import { Levels, levelsDuration, type LevelsProps } from "./Levels";

const FPS = 30;

const LEVELS: LevelsProps = {
  title: "Los cuatro niveles",
  levels: [
    { name: "El asistente", blurb: "Le hablas, te responde. Cada vez desde cero." },
    { name: "El proyecto", blurb: "Le explicas tu contexto una sola vez." },
    { name: "El conector", blurb: "Entra directo a donde vive tu información." },
    { name: "El agente", blurb: "No responde: ejecuta los pasos y te trae el resultado." },
  ],
  closing: "No es qué tan inteligente es la máquina. Es cuánto contexto tiene.",
};

export const RemotionRoot = () => {
  return (
    <Composition
      id="CuatroNiveles"
      component={Levels}
      // Derived from the content: adding a fifth level extends the video
      // instead of cutting the fourth one off mid-sentence.
      durationInFrames={levelsDuration(LEVELS.levels.length, FPS)}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={LEVELS}
    />
  );
};
