package com.gourav.npwt.repo;

import com.gourav.npwt.model.DeviceData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeviceDataRepository extends JpaRepository<DeviceData,Long> {

    List<DeviceData> findAllByOrderByTimestampAsc();
}
