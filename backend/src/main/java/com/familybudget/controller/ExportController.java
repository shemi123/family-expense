package com.familybudget.controller;

import com.familybudget.dto.transaction.TransactionFilterParams;
import com.familybudget.service.CsvExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions Export", description = "Endpoints for exporting transactions to CSV")
public class ExportController {

    private final CsvExportService csvExportService;

    @GetMapping(value = "/export", produces = "text/csv")
    @Operation(summary = "Export filtered transactions to CSV file")
    public ResponseEntity<byte[]> exportTransactions(TransactionFilterParams filterParams) throws IOException {
        byte[] csvData = csvExportService.exportTransactionsToCsv(filterParams);
        String filename = "transactions_" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }
}
