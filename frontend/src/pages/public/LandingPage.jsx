import { useState, useEffect } from 'react';
import axios from 'axios';
import { templates, TemplateModern } from '../../components/public/LandingPageTemplates';

const LandingPage = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Config
                // For now, we'll try to fetch from an endpoint, or fallback to defaults
                let loadedConfig = {};
                try {
                    const configRes = await axios.get('/api/agency/landing-config');
                    loadedConfig = configRes.data || {};
                } catch (e) {
                    console.log('No custom config found, using defaults');
                }
                setConfig(loadedConfig);

                // Fetch Vehicles for the template to use if needed
                const vehiclesRes = await axios.get('/api/vehicules?limit=6');
                setVehicles(vehiclesRes.data.vehicules || []);
            } catch (error) {
                console.error('Error loading landing page data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    // Select Template Component
    const SelectedTemplate = config?.template && templates[config.template]
        ? templates[config.template]
        : TemplateModern;

    return <SelectedTemplate config={config || {}} vehicles={vehicles} />;
};

export default LandingPage;
