package com.growup.backend.user.domain;

public final class CharacterGrowthPolicy {

    private static final long LEVEL_1_MIN_CARBON_G = 0L;
    private static final long LEVEL_2_MIN_CARBON_G = 1_610L;
    private static final long LEVEL_3_MIN_CARBON_G = 6_900L;
    private static final long LEVEL_4_MIN_CARBON_G = 20_700L;

    private CharacterGrowthPolicy() {
    }

    public static Growth calculate(long totalCarbonG) {
        long normalizedCarbonG = Math.max(totalCarbonG, 0L);

        if (normalizedCarbonG >= LEVEL_4_MIN_CARBON_G) {
            return new Growth(4, LEVEL_4_MIN_CARBON_G, null, 0L, 100.0);
        }
        if (normalizedCarbonG >= LEVEL_3_MIN_CARBON_G) {
            return createGrowth(
                    3,
                    normalizedCarbonG,
                    LEVEL_3_MIN_CARBON_G,
                    LEVEL_4_MIN_CARBON_G
            );
        }
        if (normalizedCarbonG >= LEVEL_2_MIN_CARBON_G) {
            return createGrowth(
                    2,
                    normalizedCarbonG,
                    LEVEL_2_MIN_CARBON_G,
                    LEVEL_3_MIN_CARBON_G
            );
        }
        return createGrowth(
                1,
                normalizedCarbonG,
                LEVEL_1_MIN_CARBON_G,
                LEVEL_2_MIN_CARBON_G
        );
    }

    private static Growth createGrowth(
            int level,
            long totalCarbonG,
            long currentLevelMinCarbonG,
            long nextLevelCarbonG
    ) {
        long levelRange = nextLevelCarbonG - currentLevelMinCarbonG;
        double rawProgress = (double) (totalCarbonG - currentLevelMinCarbonG)
                / levelRange
                * 100.0;
        double clampedProgress = Math.max(0.0, Math.min(rawProgress, 100.0));

        return new Growth(
                level,
                currentLevelMinCarbonG,
                nextLevelCarbonG,
                Math.max(nextLevelCarbonG - totalCarbonG, 0L),
                clampedProgress
        );
    }

    public record Growth(
            int level,
            long currentLevelMinCarbonG,
            Long nextLevelCarbonG,
            long remainingCarbonG,
            double progressPercent
    ) {
    }
}
