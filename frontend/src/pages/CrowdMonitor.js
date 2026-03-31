import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const CrowdMonitor = () => {
    const [data, setData] = useState({
        sectionA: 60,
        sectionB: 45,
        sectionC: 0, 
        capacity: 100
    });

    const [notif, setNotif] = useState(null);

    const fetchStatus = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/crowd/status');
            const result = await response.json();
            
            setData(prev => ({ 
                ...prev, 
                sectionC: result.countC,
                capacity: result.capacityC || 100 
            }));

            if (result.countC >= (result.capacityC || 100)) {
                setNotif("🚨 SECTION C IS AT FULL CAPACITY!");
            } else if (result.countC >= (result.capacityC * 0.8)) {
                setNotif("⚠️ SECTION C IS REACHING LIMIT");
            } else {
                setNotif(null);
            }
        } catch (err) {
            console.error("Crowd fetch error:", err);
        }
    };

    useEffect(() => {
        const interval = setInterval(fetchStatus, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleReset = async () => {
        try {
            await fetch('http://localhost:5000/api/crowd/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 0 })
            });
            fetchStatus();
        } catch (err) {
            console.error("Reset failed:", err);
        }
    };

    const chartData = [
        { name: 'Section A', count: data.sectionA, fill: '#3b82f6' },
        { name: 'Section B', count: data.sectionB, fill: '#10b981' },
        { 
            name: 'Section C', 
            count: data.sectionC, 
            fill: data.sectionC >= data.capacity ? '#ef4444' : data.sectionC >= (data.capacity * 0.8) ? '#f59e0b' : '#3b82f6' 
        },
    ];

    const pieData = [
        { name: 'Section A', value: data.sectionA },
        { name: 'Section B', value: data.sectionB },
        { name: 'Section C', value: data.sectionC },
        { name: 'Empty Space', value: Math.max(0, 300 - (data.sectionA + data.sectionB + data.sectionC)) }
    ];

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#334155'];

    return (
        <div style={{ 
            padding: '15px 40px', 
            color: 'white', 
            backgroundColor: '#020617', 
            height: '100vh', 
            overflow: 'hidden', 
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Inter, sans-serif',
            boxSizing: 'border-box'
        }}>
            {/* Header with Back and Reset buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <button 
                    onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                    style={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155', 
                        color: 'white', 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem',
                        // FIX: Ensure button is clickable above chart layers
                        position: 'relative',
                        zIndex: 999 
                    }}
                >
                    ← Back
                </button>

                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontWeight: '900', fontSize: '1.8rem', margin: 0 }}>LIVE VENUE OVERVIEW</h1>
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Real-time sensor data from Section C</p>
                </div>

                <button 
                    onClick={handleReset}
                    style={{ 
                        backgroundColor: 'transparent', 
                        border: '1px solid #334155', 
                        color: '#475569', 
                        padding: '8px 12px', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        position: 'relative',
                        zIndex: 999 
                    }}
                >
                    Reset System
                </button>
            </div>

            {notif && (
                <div style={{ backgroundColor: notif.includes('🚨') ? '#ef4444' : '#f59e0b', padding: '8px', borderRadius: '12px', textAlign: 'center', fontWeight: '900', margin: '10px 0', border: '2px solid white', animation: 'pulse 1s infinite' }}>
                    {notif}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flex: 1, minHeight: 0 }}>
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '24px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#f8fafc', marginBottom: '10px', marginTop: 0 }}>Live Occupancy Level</h3>
                    <div style={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                <Bar dataKey="count" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '24px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#f8fafc', marginBottom: '10px', marginTop: 0 }}>Global Distribution</h3>
                    <div style={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} innerRadius="60%" outerRadius="80%" paddingAngle={8} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '15px', marginBottom: '5px' }}>
                {chartData.map((sec) => (
                    <div key={sec.name} style={{ flex: 1, padding: '12px', backgroundColor: '#0f172a', borderRadius: '20px', textAlign: 'center', border: '1px solid #334155' }}>
                        <span style={{ color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.65rem' }}>{sec.name}</span>
                        <h2 style={{ fontSize: '1.6rem', margin: '4px 0', color: sec.count >= (data.capacity * 0.9) ? '#ef4444' : '#fff' }}>
                            {sec.count}
                            <span style={{ fontSize: '0.8rem', color: '#475569' }}> / {data.capacity}</span>
                        </h2>
                        <div style={{ width: '100%', height: '6px', backgroundColor: '#334155', borderRadius: '5px' }}>
                            <div style={{ 
                                width: `${(sec.count / data.capacity) * 100}%`, 
                                height: '100%', 
                                backgroundColor: sec.fill, 
                                borderRadius: '5px', 
                                transition: 'width 0.5s ease-in-out' 
                            }}></div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.01); } 100% { transform: scale(1); } }
                body { margin: 0; overflow: hidden; height: 100vh; }
            `}</style>
        </div>
    );
};

export default CrowdMonitor;