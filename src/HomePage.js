import HeaderComponent from './Header';
import UploadImgComponent from './UploadImage';
import './css/HomePage.css';

function HomePage() {
  return (
    <div className='Homebackground'>
        <HeaderComponent />
        <UploadImgComponent />
    </div>
  );
}

export default HomePage;    