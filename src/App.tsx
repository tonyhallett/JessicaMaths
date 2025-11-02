import { BookTest as BookTestComponent } from "./BookTest";
import { createNewBookTestSitting } from "./questions/booktests/createNewBookTestSitting";

const section1Test1 = createNewBookTestSitting(1, 1, false);

export function App() {
  return (
    <>
      <h1>Jessica it's Maths time !</h1>
      <BookTestComponent bookTestSitting={section1Test1} />
    </>
  );
}
