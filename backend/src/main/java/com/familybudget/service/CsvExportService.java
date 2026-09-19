package com.familybudget.service;

import com.familybudget.domain.entity.Transaction;
import com.familybudget.dto.transaction.TransactionFilterParams;
import com.familybudget.repository.TransactionRepository;
import com.familybudget.repository.TransactionSpecification;
import com.familybudget.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CsvExportService {

    private final TransactionRepository transactionRepository;

    private static final String[] HEADERS = {
            "Transaction ID", "Date", "Account", "Type", "Category", "Amount", "Currency", "User", "Notes", "Recurring"
    };

    @Transactional(readOnly = true)
    public byte[] exportTransactionsToCsv(TransactionFilterParams filter) throws IOException {
        UUID familyId = TenantContext.getCurrentFamilyId();
        Specification<Transaction> spec = TransactionSpecification.withFilter(familyId, filter);
        List<Transaction> transactions = transactionRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "date"));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                .setHeader(HEADERS)
                .build();

        try (CSVPrinter printer = new CSVPrinter(new OutputStreamWriter(out, StandardCharsets.UTF_8), csvFormat)) {
            for (Transaction t : transactions) {
                printer.printRecord(
                        t.getId(),
                        t.getDate(),
                        t.getAccount().getName(),
                        t.getType().name(),
                        t.getCategory().getName(),
                        t.getAmount(),
                        t.getAccount().getCurrency(),
                        t.getUser().getName(),
                        t.getNotes() != null ? t.getNotes() : "",
                        Boolean.TRUE.equals(t.getIsRecurring()) ? "Yes" : "No"
                );
            }
            printer.flush();
        }

        return out.toByteArray();
    }
}
