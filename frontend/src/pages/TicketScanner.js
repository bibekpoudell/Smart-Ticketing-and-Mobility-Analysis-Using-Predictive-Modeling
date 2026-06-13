import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const TicketScanner = ({ setView, styles }) => {
    const [result, setResult] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [status, setStatus] = useState("Initializing Camera...");
    const scannerRef = useRef(null);
    const SCANNER_ID = "qr-reader-container";

    // FIXED: useCallback now includes dependency
    const handleScanResult = useCallback(async (decodedText) => {
        if (isVerifying) return;

        setIsVerifying(true);
        setStatus("Verifying Ticket...");

        // Stop scanner immediately
        if (scannerRef.current && scannerRef.current.isScanning) {
            await scannerRef.current.stop();
        }

        try {
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
    }, [isVerifying]);

    // START SCANNER
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
                    qrbox: { width: 250, height: 250 },
                    experimentalFeatures: {
                        useBarCodeDetectorIfSupported: true
                    }
                },
                (decodedText) => {
                    handleScanResult(decodedText);
                },
                () => {}
            );
        } catch (err) {
            console.error("FAILED TO START:", err);
            setStatus("Camera Error: Check Permissions");
        }
    }, [handleScanResult]);

    // RESET SCANNER
    const resetScanner = () => {
        setResult(null);
        setStatus("Restarting Camera...");

        setTimeout(() => {
            startScanning();
        }, 300);
    };

    // EXIT SCANNER
    const stopAndExit = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                await scannerRef.current.clear();
            } catch (err) {
                console.warn("Cleanup error:", err);
            }
        }
        setView('organizer-home');
    };

    // AUTO START + CLEANUP
    useEffect(() => {
        const timer = setTimeout(startScanning, 800);

        return () => {
            clearTimeout(timer);

            if (scannerRef.current?.isScanning) {
                scannerRef.current
                    .stop()
                    .then(() => scannerRef.current.clear())
                    .catch(() => {});
            }
        };
    }, [startScanning]);

    return (
        <div
            style={{
                ...styles.heroContainer,
                padding: '20px',
                textAlign: 'center'
            }}
        >
            <button
                onClick={stopAndExit}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    zIndex: 10
                }}
            >
                ✕ Exit to Dashboard
            </button>

            <h2 style={{ color: 'white', marginTop: '50px' }}>
                Gate Scanner
            </h2>

            <p style={{ color: '#94a3b8', marginBottom: '15px' }}>
                {status}
            </p>

            {/* Scanner */}
            {!result && (
                <div
                    id={SCANNER_ID}
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        margin: '0 auto',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        border: '4px solid #2563eb',
                        backgroundColor: 'black'
                    }}
                />
            )}

            {/* Result */}
            {result && (
                <div
                    style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '20px',
                        marginTop: '20px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                    }}
                >
                    <div style={{ fontSize: '60px', marginBottom: '10px' }}>
                        {result.success ? "✅" : "❌"}
                    </div>

                    <h3
                        style={{
                            color: result.success ? '#16a34a' : '#dc2626',
                            fontSize: '24px',
                            margin: '0 0 10px 0'
                        }}
                    >
                        {result.success
                            ? "VALID ENTRY"
                            : "INVALID TICKET"}
                    </h3>

                    <p
                        style={{
                            color: '#4b5563',
                            fontSize: '18px',
                            marginBottom: '20px'
                        }}
                    >
                        {result.message}
                    </p>

                    <button
                        onClick={resetScanner}
                        style={{
                            ...styles.primaryBtn,
                            width: '100%',
                            padding: '15px',
                            fontSize: '18px'
                        }}
                    >
                        Scan Next Attendee
                    </button>
                </div>
            )}
        </div>
    );
};

export default TicketScanner;