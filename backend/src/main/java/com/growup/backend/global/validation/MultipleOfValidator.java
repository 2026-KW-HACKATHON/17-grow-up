package com.growup.backend.global.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class MultipleOfValidator implements ConstraintValidator<MultipleOf, Long> {

    private long unit;

    @Override
    public void initialize(MultipleOf constraintAnnotation) {
        unit = constraintAnnotation.value();
    }

    @Override
    public boolean isValid(Long value, ConstraintValidatorContext context) {
        return value == null || value % unit == 0;
    }
}
