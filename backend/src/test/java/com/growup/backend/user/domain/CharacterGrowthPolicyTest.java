package com.growup.backend.user.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CharacterGrowthPolicyTest {

    @Test
    void calculatesLevelOneGrowth() {
        CharacterGrowthPolicy.Growth growth = CharacterGrowthPolicy.calculate(805L);

        assertThat(growth.level()).isEqualTo(1);
        assertThat(growth.currentLevelMinCarbonG()).isZero();
        assertThat(growth.nextLevelCarbonG()).isEqualTo(1_610L);
        assertThat(growth.remainingCarbonG()).isEqualTo(805L);
        assertThat(growth.progressPercent()).isEqualTo(50.0);
    }

    @Test
    void calculatesLevelTwoGrowth() {
        CharacterGrowthPolicy.Growth growth = CharacterGrowthPolicy.calculate(3_900L);

        assertThat(growth.level()).isEqualTo(2);
        assertThat(growth.currentLevelMinCarbonG()).isEqualTo(1_610L);
        assertThat(growth.nextLevelCarbonG()).isEqualTo(6_900L);
        assertThat(growth.remainingCarbonG()).isEqualTo(3_000L);
        assertThat(growth.progressPercent()).isEqualTo(43.29);
    }

    @Test
    void calculatesLevelThreeGrowth() {
        CharacterGrowthPolicy.Growth growth = CharacterGrowthPolicy.calculate(13_800L);

        assertThat(growth.level()).isEqualTo(3);
        assertThat(growth.currentLevelMinCarbonG()).isEqualTo(6_900L);
        assertThat(growth.nextLevelCarbonG()).isEqualTo(20_700L);
        assertThat(growth.remainingCarbonG()).isEqualTo(6_900L);
        assertThat(growth.progressPercent()).isEqualTo(50.0);
    }

    @Test
    void finalLevelHasNoNextLevel() {
        CharacterGrowthPolicy.Growth growth = CharacterGrowthPolicy.calculate(20_700L);

        assertThat(growth.level()).isEqualTo(4);
        assertThat(growth.currentLevelMinCarbonG()).isEqualTo(20_700L);
        assertThat(growth.nextLevelCarbonG()).isNull();
        assertThat(growth.remainingCarbonG()).isZero();
        assertThat(growth.progressPercent()).isEqualTo(100.0);
    }

    @Test
    void exactLevelBoundariesReturnZeroProgressForNewLevel() {
        assertThat(CharacterGrowthPolicy.calculate(0L).progressPercent()).isZero();
        assertThat(CharacterGrowthPolicy.calculate(1_610L).progressPercent()).isZero();
        assertThat(CharacterGrowthPolicy.calculate(6_900L).progressPercent()).isZero();
        assertThat(CharacterGrowthPolicy.calculate(20_700L).progressPercent())
                .isEqualTo(100.0);
    }

    @Test
    void clampsInvalidOrExcessiveCarbonValues() {
        CharacterGrowthPolicy.Growth negative = CharacterGrowthPolicy.calculate(-1L);
        CharacterGrowthPolicy.Growth excessive = CharacterGrowthPolicy.calculate(Long.MAX_VALUE);

        assertThat(negative.progressPercent()).isZero();
        assertThat(negative.remainingCarbonG()).isEqualTo(1_610L);
        assertThat(excessive.progressPercent()).isEqualTo(100.0);
        assertThat(excessive.remainingCarbonG()).isZero();
    }
}
