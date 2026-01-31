import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { concernAPI } from '../../services/concernAPI';
import { API_BASE_URL } from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import { FiMapPin, FiRefreshCw, FiLoader } from 'react-icons/fi';
import L from 'leaflet';
import toast from 'react-hot-toast';
import './CitizenPages.css';

// Fix for default marker icon in React Leaflet using CDN
// This avoids issues with Vite asset importing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ConcernMap = () => {
    const [concerns, setConcerns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        fetchConcerns();

        // Real-time polling every 30 seconds
        const interval = setInterval(() => {
            fetchConcerns(true);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchConcerns = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);

            // Fetch all concerns
            const { data } = await concernAPI.getAllConcerns({ limit: 1000 });

            if (data.success) {
                // Filter:
                // 1. Must have valid coordinates
                // 2. Status must NOT be 'Resolved' or 'Rejected' (Active Tracking)
                const activeConcerns = data.data.filter(c =>
                    c.coordinates &&
                    c.coordinates.lat &&
                    c.coordinates.lng &&
                    c.status !== 'Resolved' &&
                    c.status !== 'Rejected'
                );

                setConcerns(activeConcerns);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Failed to load map data:', error);
            if (!silent) toast.error('Failed to update map data');
        } finally {
            if (!silent) setLoading(false);
            else setRefreshing(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="dashboard-layout">
                <Sidebar />
                <main className="dashboard-main" style={{ padding: 0, height: 'calc(100vh - 64px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {/* Header Overlay */}
                    <div style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '30px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        width: 'auto',
                        minWidth: '300px',
                        justifyContent: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: 'var(--success-500)',
                                boxShadow: '0 0 0 3px var(--success-100)'
                            }}></div>
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Live Tracking</span>
                        </div>
                        <div style={{ width: '1px', height: '20px', background: 'var(--border-light)' }}></div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {concerns.length} Active Issues
                            {refreshing && <FiLoader className="spin" />}
                        </div>
                    </div>

                    {loading ? (
                        <div className="spinner" style={{ margin: 'auto' }}></div>
                    ) : (
                        <div style={{ flex: 1, position: 'relative' }}>
                            <MapContainer
                                center={[17.3850, 78.4867]}
                                zoom={13}
                                style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
                                zoomControl={false}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                <ZoomControl position="bottomright" />

                                {concerns.map(concern => (
                                    <Marker
                                        key={concern._id}
                                        position={[concern.coordinates.lat, concern.coordinates.lng]}
                                    >
                                        <Popup className="custom-popup" maxWidth={320}>
                                            <div style={{ padding: '0.5rem 0' }}>
                                                {/* Status Badge */}
                                                <div style={{ marginBottom: '0.8rem' }}>
                                                    <span style={{
                                                        background: concern.status === 'In Progress' ? 'var(--primary-50)' : 'var(--warning-50)',
                                                        color: concern.status === 'In Progress' ? 'var(--primary-700)' : 'var(--warning-700)',
                                                        padding: '0.3rem 0.6rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700',
                                                        border: '1px solid currentColor',
                                                        display: 'inline-block'
                                                    }}>
                                                        {concern.status.toUpperCase()}
                                                    </span>
                                                </div>

                                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.3' }}>
                                                    {concern.title}
                                                </h3>

                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontWeight: '600' }}>{concern.category}</span>
                                                    <span>•</span>
                                                    <span>{new Date(concern.createdAt).toLocaleDateString()}</span>
                                                </div>

                                                {concern.imageUrl && (
                                                    <div style={{ marginBottom: '1rem', borderRadius: '12px', overflow: 'hidden', height: '140px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                                        <img
                                                            src={`${API_BASE_URL}${concern.imageUrl}`}
                                                            alt="Evidence"
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => e.target.style.display = 'none'}
                                                        />
                                                    </div>
                                                )}

                                                <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5', background: 'var(--bg-tertiary)', padding: '0.8rem', borderRadius: '8px' }}>
                                                    {concern.description.length > 100 ?
                                                        concern.description.substring(0, 100) + '...' :
                                                        concern.description
                                                    }
                                                </p>

                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '0.8rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                            {concern.createdBy?.name?.charAt(0) || 'U'}
                                                        </div>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                                                            {concern.createdBy?.name || 'Citizen'}
                                                        </span>
                                                    </div>

                                                    {/* We could use Link here, but Popup content handling with router can be tricky, simple text for now */}
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default ConcernMap;
