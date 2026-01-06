package com.budget_buddy.dto;

import com.budget_buddy.enums.TransactionType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TransactionRequest {
    private String title;
    private double amount;
    private TransactionType type;
    private String category;
    private LocalDateTime dateTime;
}
