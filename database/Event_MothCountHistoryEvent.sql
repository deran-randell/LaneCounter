CREATE EVENT MothCountHistoryEvent
	ON SCHEDULE
		EVERY 1 DAY
        STARTS (CURRENT_DATE + INTERVAL 1 DAY)
	DO 
		CALL DoMothHistoryMove();
        CALL DoMothArchiveMove();
