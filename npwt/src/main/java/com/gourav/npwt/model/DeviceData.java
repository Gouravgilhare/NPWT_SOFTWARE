package com.gourav.npwt.model;

import jakarta.persistence.*;
import org.springframework.boot.autoconfigure.web.WebProperties;

import java.time.LocalDateTime;

@Entity
@Table(name="device_data")
public class DeviceData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private float currentPressure;
    private int speed;
    private int targetPressure;
    private String status;
    private String mode;
    private LocalDateTime timestamp;

    public DeviceData(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public DeviceData(){
        this.timestamp= LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public float getCurrentPressure() {
        return currentPressure;
    }

    public void setCurrentPressure(float currentPressure) {
        this.currentPressure = currentPressure;
    }

    public int getSpeed() {
        return speed;
    }

    public void setSpeed(int speed) {
        this.speed = speed;
    }

    public int getTargetPressure() {
        return targetPressure;
    }

    public void setTargetPressure(int targetPressure) {
        this.targetPressure = targetPressure;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
