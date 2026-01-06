package com.budget_buddy.service;

import com.budget_buddy.dto.StatsResponse;

public interface AnalyticsService {
    StatsResponse getStats(String from, String to);

}
