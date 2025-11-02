import { BookTest } from "./BookTest";
import { section1Test1 } from "./questions/booktests/section1Templates/test1Template";

export function App() {
  return (
    <>
      <h1>Jessica it's Maths time !</h1>
      <BookTest bookTest={section1Test1} />
    </>
  );
}
