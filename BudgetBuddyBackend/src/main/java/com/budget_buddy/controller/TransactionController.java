package com.budget_buddy.controller;

import com.budget_buddy.dto.TransactionRequest;
import com.budget_buddy.dto.TransactionResponse;
import com.budget_buddy.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping("/add")
    public ResponseEntity<TransactionResponse> create(@RequestBody TransactionRequest request) {
        return ResponseEntity.ok(transactionService.createTransaction(request));
    }

    @PostMapping("/addAll")
    public ResponseEntity<List<TransactionResponse>> addAll(@RequestBody List<TransactionRequest> requests) {
        return ResponseEntity.ok(transactionService.createMultipleTransactions(requests));
    }


    @GetMapping("/getAll")
    public ResponseEntity<List<TransactionResponse>> getAll() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @DeleteMapping("/delete/{id}")
    public  ResponseEntity<String> delete(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.deleteTransaction(id));
    }

    @PostMapping("/deleteSelected")
    public ResponseEntity<String> deleteAll(@RequestBody List<Long> ids) {
        return ResponseEntity.ok(transactionService.deleteSelectedTransactions(ids));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<TransactionResponse> update(@PathVariable Long id, @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, request));
    }

}
