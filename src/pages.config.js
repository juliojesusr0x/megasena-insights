import Analysis from './pages/Analysis';
import Data from './pages/Data';
import Generator from './pages/Generator';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Analysis": Analysis,
    "Data": Data,
    "Generator": Generator,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};