import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const TicketScanner = ({ setView, styles }) => {
    const [result, setResult] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [status, setStatus] = useState("Initializing Camera...");
    const scannerRef = useRef(null);
    const SCANNER_ID = "qr-reader-container";

    // ✅ FIXED: no unstable dependency (prevents re-render loop)
    const handleScanResult = useCallback(async (decodedText) => {
        if (isVerifying) return;

        setIsVerifying(true);
        setStatus("Verifying Ticket...");

        try {
            if (scannerRef.current?.isScanning) {
                await scannerRef.current.stop();
            }

            const response = await fetch(
                'http://localhost:5000/api/tickets/verify',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ticketId: decodedText.trim() }),
                }
            );

            const data = await response.json();
            setResult(data);

        } catch (err) {
            setResult({ success: false, message: "Server connection failed" });
        } finally {
            setIsVerifying(false);
        }
    }, []); // ✅ IMPORTANT FIX (EMPTY DEP ARRAY)

    const startScanning = useCallback(async () => {
        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode(SCANNER_ID);
        }

        try {
            setStatus("Camera Active - Point at QR Code");

            await scannerRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 15,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => handleScanResult(decodedText),
                () => {}
            );

        } catch (err) {
            console.error(err);
            setStatus("Camera Error");
        }
    }, [handleScanResult]);

    const resetScanner = () => {
        setResult(null);
        setStatus("Restarting Camera...");
        setTimeout(() => startScanning(), 300);
    };

    const stopAndExit = async () => {
        if (scannerRef.current?.isScanning) {
            await scannerRef.current.stop();
            await scannerRef.current.clear();
        }
        setView('organizer-home');
    };

    useEffect(() => {
        const timer = setTimeout(startScanning, 800);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().then(() => scannerRef.current.clear()).catch(() => {});
            }
        };
    }, [startScanning]);

    return (
        <div style={{ ...styles.heroContainer, padding: '20px', textAlign: 'center' }}>

            <button onClick={stopAndExit} style={{
                position: 'absolute',
                top: 20,
                left: 20,
                background: '#dc2626',
                color: '#fff',
                padding: '10px 20px',
                border: 'none',
                borderRadius: 8
            }}>
                ✕ Exit
            </button>

            <h2 style={{ color: 'white' }}>Gate Scanner</h2>
            <p style={{ color: '#94a3b8' }}>{status}</p>

            {!result && (
                <div id={SCANNER_ID} style={{
                    width: '100%',
                    maxWidth: 400,
                    margin: 'auto',
                    border: '4px solid #2563eb',
                    borderRadius: 15
                }} />
            )}

            {result && (
                <div style={{ background: '#fff', padding: 30, borderRadius: 20 }}>
                    <h2>{result.success ? "✅ VALID" : "❌ INVALID"}</h2>
                    <p>{result.message}</p>

                    <button onClick={resetScanner}>
                        Scan Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default TicketScanner;