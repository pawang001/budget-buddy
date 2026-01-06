package com.budget_buddy.repo;

import com.budget_buddy.model.Transaction;
import com.budget_buddy.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepo extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUser(User user);

    // 1. Get total income/expense for a date range
    @Query("SELECT tx.type, SUM(tx.amount) " +
            "FROM Transaction tx " +
            "WHERE tx.user = :user AND tx.dateTime BETWEEN :start AND :end " +
            "GROUP BY tx.type")
    List<Object[]> findTransactionTotalsByUserAndDateRange(
            @Param("user") User user,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // 2. Get category breakdown for expenses in a date range
    @Query("SELECT tx.category, SUM(tx.amount) " +
            "FROM Transaction tx " +
            "WHERE tx.user = :user AND tx.type = 'EXPENSE' AND tx.dateTime BETWEEN :start AND :end " +
            "GROUP BY tx.category")
    List<Object[]> findCategoryBreakdownByUserAndDateRange(
            @Param("user") User user,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // 3. Get the 5 most recent transactions
    // We use Pageable to limit the results to 5
    List<Transaction> findByUserOrderByDateTimeDesc(User user, Pageable pageable);

    // 4. Get monthly summaries for the last 6 months (for the chart)
    @Query(value = "SELECT " +
            "  DATE_FORMAT(t.date_time, '%Y-%m') AS monthYear, " +
            "  SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END) AS monthlyIncome, " +
            "  SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END) AS monthlyExpense " +
            "FROM transaction t " +
            "WHERE t.user_id = :userId AND t.date_time >= :startDate " +
            "GROUP BY DATE_FORMAT(t.date_time, '%Y-%m') " +
            "ORDER BY monthYear ASC",
            nativeQuery = true)
    List<Object[]> findMonthlySummaries(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate);
}