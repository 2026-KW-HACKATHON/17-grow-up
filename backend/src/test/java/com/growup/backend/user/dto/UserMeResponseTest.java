package com.growup.backend.user.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.growup.backend.user.domain.CharacterType;
import com.growup.backend.user.domain.User;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.test.util.ReflectionTestUtils;

class UserMeResponseTest {

    @ParameterizedTest
    @CsvSource({
            "0, 1",
            "1609, 1",
            "1610, 2",
            "6899, 2",
            "6900, 3",
            "20699, 3",
            "20700, 4"
    })
    void calculatesCharacterLevelFromTotalCarbon(long totalCarbonG, int expectedLevel) {
        User user = User.create(
                "growup",
                "hashed-password",
                "새싹이",
                "ABCDEFGH",
                CharacterType.TREE_A
        );
        ReflectionTestUtils.setField(user, "totalCarbonG", totalCarbonG);

        UserMeResponse response = UserMeResponse.from(user);

        assertThat(response.characterLevel()).isEqualTo(expectedLevel);
    }
}
