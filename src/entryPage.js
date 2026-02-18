import projectLogo from './assets/projectLogo.png';
import "./css/entryPage.css";

function EntryPage() {
    return (
        <div className="entry-container">
            <div className="floating-element"></div>
            <div className="floating-element"></div>
            <div className="floating-element"></div>
            
            <div className="logo-container">
                <img className="entryLogo" src={projectLogo} alt="logo" />
            </div>
            
            <div className="loading-text">
                Loading<span className="loading-dots"></span>
            </div>
        
            <div className="progress-container">
                <div className="progress-bar"></div>
            </div>
        </div>
    );
}

export default EntryPage;