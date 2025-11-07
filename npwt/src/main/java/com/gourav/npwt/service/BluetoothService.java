package com.gourav.npwt.service;

import com.fazecast.jSerialComm.SerialPort;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

@Service
public class BluetoothService {

    private OutputStream outputStream;
    private static final Logger log = LoggerFactory.getLogger(BluetoothService.class);
    private final DataService dataService;
    private SerialPort port;
    private volatile boolean running = true;

    public BluetoothService(DataService dataService) {
        this.dataService = dataService;
    }

    @PostConstruct
    public void start() {
        Thread readerThread = new Thread(() -> {
            while (running) {
                try {
                    connectAndRead();
                } catch (Exception e) {
                    log.error("❌ Bluetooth connection lost. Retrying in 5s...", e);
                    sleep(5000);
                }
            }
        }, "BluetoothReaderThread");
        readerThread.setDaemon(true);
        readerThread.start();
    }

    private void connectAndRead() {
        // ⚠️ Use the correct outgoing COM port (adjust if needed)
        String portName = "COM3";
        port = SerialPort.getCommPort(portName);
        port.setBaudRate(115200);
        port.setComPortTimeouts(SerialPort.TIMEOUT_READ_BLOCKING, 2000, 0);

        if (!port.openPort()) {
            log.error("❌ Failed to open port {}", portName);
            sleep(2000);
            return;
        }

        log.info("✅ Connected to ESP32 on port {}", portName);
        sleep(1000); // allow link stabilization

        try (InputStream in = port.getInputStream()) {
            outputStream = port.getOutputStream();
            StringBuilder buffer = new StringBuilder();
            while (running && port.isOpen()) {
                int data = in.read();
                if (data == -1) {
                    // read timed out, just continue
                    continue;
                }

                char c = (char) data;
                if (c == '\n' || c == '\r') {
                    String line = buffer.toString().trim();
                    buffer.setLength(0);
                    if (!line.isEmpty()) {
                        if (line.startsWith("{") && line.endsWith("}")) {
                            log.info("📩 Received: {}", line);

                            // Parse JSON to Map and update latestData
                            try {
                                Map<String,Object> map = new com.fasterxml.jackson.databind.ObjectMapper()
                                        .readValue(line, Map.class);
                                updateLatestData(map);
                            } catch (Exception e) {
                                log.warn("⚠️ Failed to parse JSON: {}", line, e);
                            }

                            // Save locally / handle data
                            dataService.handleJson(line);
                        }
                        else {
                            log.warn("⚠️ Ignored invalid line: {}", line);
                        }
                    }
                } else {
                    buffer.append(c);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Error reading Bluetooth data", e);
        } finally {
            if (port.isOpen()) {
                port.closePort();
                log.info("🔌 Port closed.");
            }
        }
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ignored) {
        }
    }

    public synchronized void sendCommand(String command){
        try{
            if(outputStream!=null){
                outputStream.write((command+"\n").getBytes());
                outputStream.flush();
                log.info("Sent command :" + command);
            }else{
                log.warn("OutputStream not ready. esp32 migh be disconnected.");
            }
        } catch (Exception e) {
            log.error("Failed to send command : ",command,e);
        }
    }

    private Map<String ,Object> latestData = new java.util.HashMap<>();
    public void updateLatestData(Map<String,Object>data){
        synchronized (latestData){
            latestData.clear();
            latestData.putAll(data);
        }
    }

    public Map<String,Object>getLatestData(){
        synchronized (latestData){
            return new HashMap<>(latestData);
        }
    }
    @PreDestroy
    public void cleanup() {
        running = false;
        if (port != null && port.isOpen()) {
            port.closePort();
            log.info("Bluetooth port closed on shutdown.");
        }
    }
}
