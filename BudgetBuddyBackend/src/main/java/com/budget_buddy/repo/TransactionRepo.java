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

    // ===== TOTAL INCOME / EXPENSE =====
    @Query("""
        SELECT tx.type, SUM(tx.amount)
        FROM Transaction tx
        WHERE tx.user = :user
          AND tx.dateTime BETWEEN :start AND :end
        GROUP BY tx.type
    """)
    List<Object[]> findTransactionTotalsByUserAndDateRange(
            @Param("user") User user,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    // ===== CATEGORY BREAKDOWN =====
    @Query("""
        SELECT tx.category, SUM(tx.amount)
        FROM Transaction tx
        WHERE tx.user = :user
          AND tx.type = 'EXPENSE'
          AND tx.dateTime BETWEEN :start AND :end
        GROUP BY tx.category
    """)
    List<Object[]> findCategoryBreakdownByUserAndDateRange(
            @Param("user") User user,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    // ===== RECENT TRANSACTIONS =====
    List<Transaction> findByUserOrderByDateTimeDesc(User user, Pageable pageable);

    // ===== MYSQL (LOCAL) =====
    @Query(value = """
        SELECT
          DATE_FORMAT(t.date_time, '%Y-%m') AS monthYear,
          SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END) AS income,
          SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END) AS expense
        FROM transaction t
        WHERE t.user_id = :userId
          AND t.date_time >= :startDate
        GROUP BY DATE_FORMAT(t.date_time, '%Y-%m')
        ORDER BY monthYear
    """, nativeQuery = true)
    List<Object[]> findMonthlySummariesMySql(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate
    );

    // ===== POSTGRESQL (PROD) =====
    @Query(value = """
        SELECT
          to_char(date_trunc('month', t.date_time), 'YYYY-MM') AS monthYear,
          SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END) AS income,
          SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END) AS expense
        FROM transaction t
        WHERE t.user_id = :userId
          AND t.date_time >= :startDate
        GROUP BY date_trunc('month', t.date_time)
        ORDER BY monthYear
    """, nativeQuery = true)
    List<Object[]> findMonthlySummariesPostgres(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate
    );
}
