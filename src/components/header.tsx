import { Link } from 'react-router';
import logo from '../assets/logo.svg';

const Header = (): JSX.Element => {
  return (
    <>
      <div className="flex justify-center mt-6">
        <Link to="/">
          <img src={logo} alt="Mountain logo" />
        </Link>
      </div>
      <h1 className="mb-5 text-center">
        Sbal se rychle a bez stresu
      </h1>
    </>
  );
};

export default Header;
