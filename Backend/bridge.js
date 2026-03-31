const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const axios = require('axios');

// 1. Set your COM Port (Check Arduino IDE -> Tools -> Port)
const port = new SerialPort({ path: 'COM3', baudRate: 115200 }); 
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

console.log("🚀 Bridge Started: Listening for ESP32 on USB...");

parser.on('data', async (data) => {
    // Expected data format from ESP32: "1" or "5" (just the number)
    const countValue = parseInt(data.trim());

    if (!isNaN(countValue)) {
        console.log(`📡 Sending Section C Count: ${countValue} to Server...`);
        try {
            await axios.post('http://localhost:5000/api/crowd/update', {
                count: countValue
            });
        } catch (err) {
            console.error("❌ Failed to send to backend. Is server running?");
        }
    }
});