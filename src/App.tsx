import GearListForm from './components/gearListForm';
import Header from './components/header';

const App = (): JSX.Element => {
  return (
    <>
      <div>
        <Header />
        <div className="mx-3 sm:mx-6 flex flex-col justify-center">
          <GearListForm />
        </div>
      </div>
    </>
  );
};

export default App;
