package com.growup.backend.mission.repository;

public interface MissionCompletionStatProjection {

    Long getMissionId();

    String getMissionName();

    long getCompletionCount();
}
