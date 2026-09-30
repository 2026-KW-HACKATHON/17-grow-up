package com.growup.backend.user.domain;

import java.util.concurrent.ThreadLocalRandom;

public enum CharacterType {
    TREE_A,
    TREE_B,
    TREE_C,
    TREE_D,
    TREE_E;

    private static final CharacterType[] VALUES = values();

    public static CharacterType random() {
        return VALUES[ThreadLocalRandom.current().nextInt(VALUES.length)];
    }
}
