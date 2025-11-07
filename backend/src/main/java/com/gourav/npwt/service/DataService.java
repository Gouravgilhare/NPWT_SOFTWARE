package com.gourav.npwt.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
public class DataService {

    private final ObjectMapper mapper = new ObjectMapper();
    private final Path localFile = Paths.get("npwt_data.json");

    // 🟡 AWS temporarily disabled
    // private final S3Client s3 = S3Client.builder()
    //         .region(Region.AP_SOUTH_1)
    //         .credentialsProvider(ProfileCredentialsProvider.create())
    //         .build();
    //
    // private final String bucketName = "npwt-device-data";

    public void handleJson(String jsonLine) {
        try {
            Map<String, Object> data = mapper.readValue(jsonLine, Map.class);
            saveLocal(data);

            // 🚫 Skip S3 for now
            // uploadToS3(data);

        } catch (Exception e) {
            System.out.println("Invalid JSON: " + jsonLine);
            e.printStackTrace();
        }
    }

    private void saveLocal(Map<String,Object> data) throws Exception {
        List<Map<String,Object>> existing = new ArrayList<>();
        if (Files.exists(localFile)) {
            existing = Arrays.asList(mapper.readValue(localFile.toFile(), Map[].class));
        }
        existing = new ArrayList<>(existing); // mutable list
        existing.add(data);                   // add new data
        mapper.writerWithDefaultPrettyPrinter().writeValue(localFile.toFile(), existing);
        System.out.println("💾 Saved locally: " + data);
    }


    // 🟢 Stubbed S3 method
    private void uploadToS3(Map<String, Object> data) {
        System.out.println("⚠️ S3 upload skipped (AWS disabled).");
    }
    public Map<String,Object> getLatestReading(){
        try{
            if(Files.exists(localFile)){
                List<Map<String,Object>> list =
                        Arrays.asList(mapper.readValue(localFile.toFile(), Map[].class));
                System.out.println("Read latest data: " + list.get(list.size()-1));
                return list.get(list.size()-1);
            } else {
                System.out.println("No local file found.");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Map.of("error","no data yet");
    }


    public List<Map<String, Object>> getAllReadings() {
        try {
            if (Files.exists(localFile)) {
                return Arrays.asList(mapper.readValue(localFile.toFile(), Map[].class));
            }
        } catch (Exception ignored) {}
        return List.of();
    }



}
