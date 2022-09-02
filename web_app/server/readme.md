# **Lane Counter Web Server**
The project receives moth data from from an MQTT broker and stores it in a MySQL database. 
The data is served to a web UI.

## **Run**
Deployment folder structure:
> LaneCounter/lane_counter_server - for interfacing with the counter hardware, and sending the count to the MQTT broker
> LaneCounter/web_app/server - for receiving the data from the MQTT broker and storing it in a MySQL database; serving the data for the web ui (node.js, express, MySQL)
> LaneCounter/web_app/client/build - web client to display the data (react)

After deployment, from the "server" sub-directory, run the app with the command> npm start

## **Deployment**

1. **Install node.js**  node-v16.5.0-x64.msi

	- At command prompt, install "serve":
	- >npm install -g serve


2. **Install MySQL**   mysql-installer-community-8.0.28.0.msi

    - Choose "Server only" install option
    - Type and Networking -> Server Configuration Type = Server Computer
    - Connectivity -> leave defaults (port 3306)
    - Use Strong Password Protection
    - Root Account Password = cybicom
    - MySQL User Accounts -> Add User -> Name = moth, Host = All Hosts, Role = DB Admin, Authentication = MySQL, Password = Bazinga!
    - Windows Service -> leave defaults
	- Navigate to "C:\ProgramData\MySQL\MySQL Server 8.0\Uploads" and create directory called "mothdb"

    > To view users, use the command line MySQL> SELECT user, host FROM mysql.user;
    > To change the user password, use the command line MySQL> ALTER USER moth@'%' IDENTIFIED BY 'password';
	
	
3. **Create mothdb database**

    - Open MySQL Command Line Client (password for "root" is "cybicom"
	- mysql>use mothdb;
    - mysql>\. D:/path/to/file/moth_db_filename.sql
	- mysql>\. D:/path/to/file/InitialiseLaneTotals.sql	
	- mysql>\. D:/path/to/file/Event_MothCountHistoryEvent.sql
	
> The MySQL data backups (for the raw moth data before archives are done each day and month) are located in: "C:\ProgramData\MySQL\MySQL Server 8.0\Uploads\mothdb"
> For the script to create the mothdb database, see the readme.md file in the project "database" directory
	

3. **Install Mosquitto**  mosquitto-2.0.14-install-windows-x64.exe

    > See Mosquitto broker setup configuration below

### **Mosquitto Broker setup to allow external connections to the broker**

1. Navigate to installation path of the mosquitto broker application and open the ***mosquitto.conf*** file.

    > The installation path is usually (unless specified differently during installation): ***C:\Program Files\mosquitto***

2. In the mosquitto.conf file, find the ***allow_anonymous*** section and set it to the following: _allow\_anonymous true_

3. In the mosquitto.conf file, find the ***listener*** section and set it to the following: _listener 1883 0.0.0.0_

    > This can be added after the line: #listener port-number [ip address/host name/unix socket path]
     