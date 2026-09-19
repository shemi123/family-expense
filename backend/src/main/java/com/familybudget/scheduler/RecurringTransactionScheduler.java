package com.familybudget.scheduler;

import com.familybudget.service.RecurringTransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecurringTransactionScheduler {

    private final RecurringTransactionService recurringService;

    // Runs daily at 1:00 AM server time
    @Scheduled(cron = "0 0 1 * * ?")
    public void runDailyRecurringProcessor() {
        log.info("Starting daily recurring transactions processor...");
        int count = recurringService.processDueRecurringTransactions(LocalDate.now());
        log.info("Completed recurring transactions processing. Generated {} transactions.", count);
    }
}
