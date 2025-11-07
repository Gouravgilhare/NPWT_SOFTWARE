package com.gourav.npwt.controller;


import com.gourav.npwt.service.DataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/data")
public class DataController {
    private final DataService dataService;

    public DataController(DataService dataService) {
        this.dataService = dataService;
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestData(){
        return ResponseEntity.ok(dataService.getLatestReading());
    }

    @GetMapping("/all")
    public ResponseEntity<?>getAllData(){
        return ResponseEntity.ok(dataService.getAllReadings());
    }

}
