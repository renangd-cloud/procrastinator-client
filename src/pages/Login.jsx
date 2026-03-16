import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const Login = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleLogin = () => {
        window.location.href = 'http://localhost:3000/api/auth/login';
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'radial-gradient(circle at top right, #1e293b, #0f172a)'
        }}>
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', width: '400px' }}>
                <h1 style={{ marginBottom: '30px', fontSize: '2rem', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Procrastinator
                </h1>
                <p style={{ marginBottom: '40px', color: '#94a3b8' }}>
                    Master your time, eventually.
                </p>
                <button className="btn-primary" onClick={handleLogin} style={{ width: '100%', padding: '15px' }}>
                    Login with Microsoft
                </button>
            </div>
        </div>
    );
};

export default Login;
