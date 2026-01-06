package com.budget_buddy.service;

import com.budget_buddy.dto.StatsResponse;
import com.budget_buddy.dto.StatsResponse.MonthlySummary;
import com.budget_buddy.dto.StatsResponse.TransactionDto;
import com.budget_buddy.enums.TransactionType;
import com.budget_buddy.model.User;
import com.budget_buddy.repo.TransactionRepo;
import com.budget_buddy.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    @Autowired
    private TransactionRepo transactionRepo;

    @Autowired
    private UserRepo userRepo;

    // Formatter for the monthly chart (e.g., "Oct")
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MMM");

    @Override
    public StatsResponse getStats(String from, String to) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        LocalDate startDate = (from != null)
                ? LocalDate.parse(from)
                : LocalDate.now().minusDays(30);

        LocalDate endDate = (to != null)
                ? LocalDate.parse(to)
                : LocalDate.now();

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        // For monthly chart (last 6 months ending at "end")
        LocalDateTime sixMonthsAgo = end.minusMonths(5).withDayOfMonth(1);

        // ===== TOTALS =====
        double totalIncome = 0;
        double totalExpense = 0;

        List<Object[]> totals =
                transactionRepo.findTransactionTotalsByUserAndDateRange(
                        user, start, end
                );

        for (Object[] row : totals) {
            TransactionType type = (TransactionType) row[0];
            double sum = ((Number) row[1]).doubleValue();

            if (type == TransactionType.INCOME) totalIncome = sum;
            else totalExpense = sum;
        }

        double balance = totalIncome - totalExpense;

        // ===== CATEGORY BREAKDOWN =====
        Map<String, Double> categoryBreakdown =
                transactionRepo.findCategoryBreakdownByUserAndDateRange(
                                user, start, end
                        ).stream()
                        .collect(Collectors.toMap(
                                r -> (String) r[0],
                                r -> ((Number) r[1]).doubleValue()
                        ));

        // ===== RECENT TRANSACTIONS =====
        List<TransactionDto> recentTransactions =
                transactionRepo.findByUserOrderByDateTimeDesc(
                                user, PageRequest.of(0, 5)
                        ).stream()
                        .map(tx -> new TransactionDto(
                                tx.getId(),
                                tx.getTitle(),
                                tx.getAmount(),
                                tx.getType(),
                                tx.getCategory(),
                                tx.getDateTime()
                        ))
                        .toList();

        // ===== MONTHLY CHART =====
        List<MonthlySummary> monthly =
                transactionRepo.findMonthlySummaries(
                                user.getId(), sixMonthsAgo
                        ).stream()
                        .map(r -> {
                            String month = YearMonth
                                    .parse((String) r[0])
                                    .format(MONTH_FORMATTER);

                            return new MonthlySummary(
                                    month,
                                    ((Number) r[1]).doubleValue(),
                                    ((Number) r[2]).doubleValue()
                            );
                        })
                        .toList();

        return new StatsResponse(
                totalIncome,
                totalExpense,
                balance,
                categoryBreakdown,
                recentTransactions,
                monthly,
                LocalDateTime.now()
        );
    }
}