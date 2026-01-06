package com.budget_buddy.dto;

import com.budget_buddy.enums.TransactionType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record StatsResponse(double totalIncome, double totalExpense, double balance,

                            Map<String, Double> categorySummary,

                            List<TransactionDto> recentTransactions,

                            List<MonthlySummary> monthly,

                            LocalDateTime lastSync) {
    public record TransactionDto(Long id, String title, double amount, TransactionType type, String category,
                                 LocalDateTime dateTime) {
    }

    public record MonthlySummary(String month, double income, double expense) {
    }
}