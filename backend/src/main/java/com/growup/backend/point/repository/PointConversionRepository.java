package com.growup.backend.point.repository;

import com.growup.backend.point.domain.PointConversion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PointConversionRepository extends JpaRepository<PointConversion, Long> {

    List<PointConversion> findAllByUserIdOrderByCreatedAtDescIdDesc(Long userId);
}
