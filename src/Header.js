import "./css/Header.css";
import projectLogo from './assets/projectLogo.png';

function createSearchPage() {
    return(
    <>
        <div className="searchHeader">
            <a href="https://www.linkedin.com/in/anshul-sharma-831ans/" target="_blank">
            <img className="projectLogo" src={projectLogo} alt="logo"/>
            </a>
            <h1 className="projectTitle">Find Similar Image</h1>
            <a href="https://github.com/AnshulSharma831/Visual-Matcher/tree/main/server" target="_blank">
            <button className="darkModeButton">GitHub Repository</button>
            </a>
        </div>
    </>
);
}

export default createSearchPage;
