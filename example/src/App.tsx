import { Playground } from "./Playground";

const exampleCSS = `/* Taken from https://www.joshwcomeau.com/css/transforms/ */
body {
  height: 100%;
  margin: 0;
  display: grid;
  place-items: center;
  background: rgb(30, 30, 30);
}

.wrapper {
  position: relative;
}

.planet {
  width: 80px;
  height: 80px;
  background: dodgerblue;
  border-radius: 50%;
}

.moon {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  width: 20px;
  height: 20px;
  background: hotpink;
  border-radius: 50%;
}
`;

const exampleHTML = `<!-- Taken from: https://www.joshwcomeau.com/css/transforms/ -->
<style>
  @keyframes orbit {
    from {
      transform:
        rotate(0deg)
        translateX(80px);
    }
    to {
      transform:
        rotate(360deg)
        translateX(80px);
    }
  }

  @media (
    prefers-reduced-motion: no-preference
  ) {
    .moon {
      animation:
        orbit 6000ms linear infinite;
    }
  }
</style>

<div class="wrapper">
  <div class="planet"></div>
  <div class="moon"></div>
</div>
`;

export function App() {
  return (
    <div className="container">
      <Playground initialCSS={exampleCSS} initialHTML={exampleHTML} />
    </div>
  );
}
