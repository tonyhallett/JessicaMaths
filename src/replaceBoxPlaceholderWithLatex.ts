export const BoxPlaceholder = "{?}";
let boxBorderColour = "black";
let boxBackgroundColour = "pink";
export function setBoxColours(border: string, background: string) {
  boxBorderColour = border;
  boxBackgroundColour = background;
}

// Katex does have Box and square....
export const replaceBoxPlaceholderWithLatex = (latexString: string) => {
  return latexString.replace(
    BoxPlaceholder,
    `\\fcolorbox{${boxBorderColour}}{${boxBackgroundColour}}{\\phantom{1}}`
  );
};
