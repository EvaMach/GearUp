import { Link } from 'react-router';
import logo from '../assets/logo.svg';
import AuthButton from './auth/authButton';

const Header = (): JSX.Element => {
  return (
    <>
      <div className="flex justify-between items-center mt-6 px-6">
        <div className="flex-1"></div>
        <Link to="/" className="flex-1 flex justify-center">
          <img src={logo} alt="Mountain logo" />
        </Link>
        <div className="flex-1 flex justify-end">
          <AuthButton variant="header" />
        </div>
      </div>
      <h1 className="mb-5 text-center">Sbal se rychle a bez stresu</h1>
    </>
  );
};

export default Header;
