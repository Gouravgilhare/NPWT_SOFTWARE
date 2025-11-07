    package com.gourav.npwt.controller;


    import com.gourav.npwt.service.BluetoothService;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    @RestController
    @RequestMapping("/api/bluetooth")
    @CrossOrigin(origins = "*")
    public class BluetoothController {
        private final BluetoothService bluetoothService;

        public BluetoothController(BluetoothService bluetoothService){
            this.bluetoothService=bluetoothService;
        }

    //    @PostMapping("/send")
    //    public ResponseEntity<String> sendCommand(@RequestBody String commandJson) {
    //        try {
    //            bluetoothService.sendCommand(commandJson);
    //            return ResponseEntity.status(HttpStatus.OK)
    //                    .body("Command sent: " + commandJson);
    //        } catch (Exception e) {
    //            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    //                    .body("Failed to send command: " + e.getMessage());
    //        }
    //    }

        @PostMapping("/send")
        public String sendCommand(@RequestBody String commandJson) {
            // Remove formatting (line breaks and extra spaces)
            String compactJson = commandJson.replaceAll("\\s+", " ");
            bluetoothService.sendCommand(compactJson);
            return "✅ Command sent: " + compactJson;
        }



    }

