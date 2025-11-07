package com.gourav.npwt.controller;

import ch.qos.logback.classic.pattern.ClassOfCallerConverter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gourav.npwt.model.DeviceData;
import com.gourav.npwt.repo.DeviceDataRepository;

import com.gourav.npwt.service.BluetoothService;
import com.gourav.npwt.service.DataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/device")
public class DeviceController {

    @Autowired
    private BluetoothService bluetoothService;

    @Autowired
    private  DeviceDataRepository repo;
    public DeviceController(DeviceDataRepository repository) {
        this.repo = repository;
    }

    @PostMapping("/save")
    public DeviceData save(@RequestBody DeviceData data) {
        return repo.save(data);
    }

    @GetMapping("/all")
    public List<DeviceData> getAll() {
        return repo.findAll();
    }
    @GetMapping("/status")
    public ResponseEntity<Map<String,Object>> getStatus() {
        return ResponseEntity.ok(bluetoothService.getLatestData());
    }
    @PostMapping("/data")
    public DeviceData receiveData(@RequestBody DeviceData data) {
        data.setTimestamp(LocalDateTime.now());
        return repo.save(data);
    }

    @GetMapping("/logs")
    public List<DeviceData>getlogs(){
        return repo.findAllByOrderByTimestampAsc();
    }
    @PostMapping("/log")
    public DeviceData logData(@RequestBody DeviceData data){
        data.setTimestamp(LocalDateTime.now());
        return repo.save(data);
    }


    @GetMapping("/data")
    public List<DeviceData> getAllData() {
        return repo.findAll();
    }


    @PostMapping("/command")
    public ResponseEntity<String>sendCommand(@RequestBody Map<String,Object> command){
        try {
            String jsonCommand = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(command);
            bluetoothService.sendCommand(jsonCommand);
            return ResponseEntity.ok("Command sent successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to send command : "+ e.getMessage());
        }
    }

    @GetMapping("/local-data")
    public ResponseEntity<?>getLocalJsonData(){
            try{
                Path filePath = Paths.get("npwt_data.json");
                if(!Files.exists(filePath)){
                    return ResponseEntity.status(404).body(Map.of("message","NO local data file found"));
                }
                String json = Files.readString(filePath);

                ObjectMapper mapper = new ObjectMapper();
                Object jsonData  = mapper.readValue(json, Object.class);

                return ResponseEntity.ok(jsonData);
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.internalServerError().body(Map.of("error",e.getMessage()));
            }
    }


}
