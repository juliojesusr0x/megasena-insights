import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Generator from './pages/Generator';
import Data from './pages/Data';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Analysis": Analysis,
    "Generator": Generator,
    "Data": Data,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};