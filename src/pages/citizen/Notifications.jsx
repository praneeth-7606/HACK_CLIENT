import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import EnhancedNotifications from '../../components/notifications/EnhancedNotifications';
import '../Pages.css';

const Notifications = () => {
    return (
        <>
            <Navbar />
            <div className="dashboard-layout">
                <Sidebar />
                <main className="dashboard-main">
                    <EnhancedNotifications />
                </main>
            </div>
        </>
    );
};

export default Notifications;
