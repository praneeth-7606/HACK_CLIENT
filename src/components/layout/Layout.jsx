import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <>
            <Sidebar />
            <Navbar />
            <main className="dashboard-main">
                {children}
            </main>
        </>
    );
};

export default Layout;
