package com.gourav.npwt.service;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gourav.npwt.model.DeviceData;
import com.gourav.npwt.repo.DeviceDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DeviceService {

    @Autowired
    private DeviceDataRepository repo;

    private final ObjectMapper mapper = new ObjectMapper();

    public void saveJsonData(String json){
        try{
            JsonNode node = mapper.readTree(json);
            DeviceData data = new DeviceData();
            data.setCurrentPressure((float) node.get("currentPressure").asDouble());
            data.setSpeed(node.get("speed").asInt());
            data.setTargetPressure(node.get("targetPressure").asInt());
            data.setStatus(node.get("status").asText());
            data.setMode(node.get("mode").asText());
            repo.save(data);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
