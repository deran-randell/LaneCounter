### Export and create MOTHDB database ###

To export the mothdb create script:

1. MySQL Workbench -> open the moth.mwb model
2. Use File -> Export -> Forward Engineer SQL CREATE Script
3. Add the MothCountHistoryEvent creation to the end of the CREATE script
4. Open MySQL Command Line Client (password for "root" is "cybicom"
5. mysql>DROP DATABASE mothdb;
6. mysql>\. D:/path/to/file/moth_db_filename.sql
7. mysql>\. D:/path/to/file/InitialiseLaneTotals.sql


To view events, use: 
> SHOW EVENTS FROM mothdb;