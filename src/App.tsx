import { Outlet } from 'react-router';
import Header from './components/header';

const App = (): JSX.Element => {
  return (
    <>
      <div>
        <Header />;
        <div className="mx-3 sm:mx-6 flex flex-col justify-center">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default App;
