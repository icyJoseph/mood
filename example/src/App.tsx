import { Playground } from "./Playground";

export function App() {
  return (
    <div className="container">
      <Playground
        initialCSS={`.blue { color: blue; }
      
.red { color: red; }`}
        initialHTML={`<div class="red blue">Am I red or blue?</div>`}
      />
    </div>
  );
}
