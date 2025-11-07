# NPWT (Negative Pressure Wound Therapy) — Backend

Small Spring Boot service that reads JSON lines from an ESP32 over a serial/virtual COM port, persists readings locally (npwt_data.json) and exposes REST endpoints.

## Prerequisites

- Java 21
- Maven
- On Windows: ensure the correct COM port is available and accessible
- (Optional) MySQL if you enable JPA persistence to a database

## Configure serial port

Open `src/main/java/com/gourav/npwt/service/BluetoothService.java` and set the correct port name:

- Currently: `String portName = "COM3";`
  Change `"COM3"` to the COM port your ESP32 uses.

## Build & run

From the project root:

- Build: `mvn -DskipTests package`
- Run: `mvn spring-boot:run` or `java -jar target/npwt-0.0.1-SNAPSHOT.jar`

## Local data storage

- Incoming JSON lines are appended to `npwt_data.json` in the application working directory.
- The file contains an array of JSON objects.

## Useful REST endpoints

- GET /api/data/latest — returns the latest saved reading
- GET /api/data/all — returns all saved readings
- POST /api/bluetooth/send — send a JSON command to the device (body: JSON string)
- GET /api/device/status — returns last parsed data from BluetoothService
- Device JPA endpoints:
  - POST /api/device/save
  - GET /api/device/all
  - POST /api/device/data
  - GET /api/device/data

All endpoints are CORS-enabled for `*` by default.

## Troubleshooting

- "Failed to open port": verify the port name and that no other app is using it.
- If no data is saved, check that the ESP32 sends newline-terminated JSON objects (one object per line).
- Check logs for parsing errors or port errors.

## Notes

- S3 upload is disabled; local storage is used by default.
- Adjust baud rate and timeouts in `BluetoothService` if required.

## License

MIT
