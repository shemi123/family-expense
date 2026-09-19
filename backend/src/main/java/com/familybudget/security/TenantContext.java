package com.familybudget.security;

import java.util.UUID;

public final class TenantContext {

    private static final ThreadLocal<UUID> CURRENT_FAMILY_ID = new ThreadLocal<>();

    private TenantContext() {
    }

    public static void setCurrentFamilyId(UUID familyId) {
        CURRENT_FAMILY_ID.set(familyId);
    }

    public static UUID getCurrentFamilyId() {
        return CURRENT_FAMILY_ID.get();
    }

    public static void clear() {
        CURRENT_FAMILY_ID.remove();
    }
}
