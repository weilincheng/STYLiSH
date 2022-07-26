# Wei-Lin Cheng

## Table of Contents

- [Web Site](#web-site)

  - [Website URL](#website-url)
  - [Start the web server](#start-the-web-server)
  - [Run the server in background](#run-the-server-in-background)
  - [Instal MySQL](#instal-mysql)
  - [Create database](#create-database)
  - [Dump SQL file](#dump-sql-file)
  - [Install Redis on Mac](#install-redis-on-mac)
  - [Install Redis on EC2](#install-redis-on-ec2)
    - [Run Redis in background](#run-redis-in-background)

- [To-do](#to-do)

- [Midterm](#midterm)

## Web Site

### Website URL

- [http://52.11.18.184](http://52.11.18.184)

### Start the web server

```
node index.js
```

### Run the server in background

1. Install pm2

   ```
   npm install pm2 -g
   ```

2. Redirect port 80 to 8080

   - Use Nginx (Recommended)

     - Install

       ```
       amazon-linux-extras list | grep nginx
       sudo amazon-linux-extras install nginx1
       ```

     - Start Nginx

       ```
       sudo systemctl enable nginx.service
       systemctl status nginx.service
       ```

     - Edit the config

       Open this file

       ```
       sudo /etc/nginx/nginx.conf

       ```

       And add the below. Note: last two lines is to get the real ip.

       ```
       location / {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       ```

   - Use iptables (Not recommended)

     ```
     sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080
     ```

     - You can use the below command to remove it

       ```
       sudo iptables -t nat -v -L PREROUTING -n --line-number
       sudo iptables -t nat -D PREROUTING {rule-number-here}
       ```

3. Use pm2 to start the script

   ```
   pm2 start index.js --name Stylish
   ```

4. Configure PM2 to automatically startup the process after a reboot

   ```
   pm2 start index.js

   sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user

   pm2 save
   ```

### Enable SSL by using local-ssl-proxy

    ```
    npm install -g local-ssl-proxy
    local-ssl-proxy --source 433 --target 8080

    ```

### Instal MySQL

1. Install an RPM repository package by running the commands below:

   ```
   sudo yum install https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm`
   ```

2. Install MySQL 8 server packages on Amazon Linux2

   ```
   sudo amazon-linux-extras install epel -y

   sudo yum -y install mysql-community-server
   ```

   - Refer to [ec2-install-extras-library-software](https://aws.amazon.com/premiumsupport/knowledge-center/ec2-install-extras-library-software/)

3. Start MySQL server services

   ```
   sudo systemctl enable --now mysqld
   ```

4. Confirm if MySQL server service is started and running

   ```
   systemctl status mysqld
   ```

5. Get the temparory password

   ```
   sudo grep 'temporary password' /var/log/mysqld.log
   ```

6. Log-in MySQL with root

   ```
   sudo mysql_secure_installation -p
   mysql -u root -p
   ```

### Create database

1. Create a new user

   ```
   CREATE USER 'weilin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'xxxxxxx';
   SELECT user, host FROM mysql.user;

   GRANT ALL PRIVILEGES ON * . * TO 'weilin'@'localhost';
   FLUSH PRIVILEGES;
   SHOW GRANTS FOR 'weilin'@'localhost';
   ```

2. Createa a new database/table

   ```
   CREATE DATABASE stylish;
   USE stylish;
   CREATE TABLE product(
       id BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
       title VARCHAR(255) NOT NULL,
       PRIMARY KEY(id)
   );

   SHOW TABLES;
   ```

3. Insert some data for testing

```
INSERT INTO product(title) VALUES ('Google Chrome');
```

### Dump SQL file

```
mysqldump -u weilin -p --databases stylish > dump.sql
```

### Install Redis on Mac

```
brew install redis
```

- redis config is located at `/opt/homebrew/etc/redis.conf`
- ACL file is located at `/etc/redis/users.acl`

### Install Redis on EC2

1. Refer to official doc [Install Redis from Source](https://redis.io/docs/getting-started/installation/install-redis-from-source/)

   ```
   wget https://download.redis.io/redis-stable.tar.gz
   ```

2. Modify conf file

   ```
   aclfile /etc/redis/users.acl
   supervised no
   ```

3. Add an external ACL file

   ```
   user default off
   user <user> ~* &* +@all on ><password>
   ```

#### Run Redis in background

1. Add redis service file at `/lib/systemd/system/redis.service`

   ```
   [Unit]
   Description=redis
   After=network.target

   [Service]
   ExecStart=/usr/local/bin/redis-server /home/ec2-user/redis-stable/redis.conf
   ExecStop=/usr/local/bin/redis-cli -h 127.0.0.1 -p 6379 shutdown

   [Install]
   WantedBy=multi-user.target
   ```

2. Start and enable redis

   ```
   sudo systemctl start redis
   ```

### Install the CloudWatch Logs Agent

```
sudo yum install -y awslogs
sudo systemctl start awslogsd
```

- Edit the /etc/awslogs/awslogs.conf file to configure the logs to track. For more information about editing this file, see CloudWatch Logs agent reference.
- By default, the /etc/awslogs/awscli.conf points to the us-east-1 Region. To push your logs to a different Region, edit the awscli.conf file and specify that Region.

## To-Do

- [ ] Refactor routes to add product
- [ ] Add [validator](https://www.npmjs.com/package/validator) in server side
- [x] Validate the existing access token in checkout page
- [x] Switch to Nginx to resolve port 80 issue
- [x] Build a front-end page for user log in
- [x] Integrate ESLint with Prettier
- [x] Validate the existing access token (currently user needs to delete it from local storage by themselves)

## Midterm

### Dabashboard Link

- [https://stylishbe.xyz/admin/dashboard.html](https://stylishbe.xyz/admin/dashboard.html)

### Auto-refresh

- Example account for checkout
  - name: test@test.com
  - password: test

### Performance Tuning and Analysis

- How much time does your server spend to aggregate the data and render the page?

  - Data aggregation: It took 953ms to fetch all the information from the servers
  - Rendering: It took 108ms to render the charts
  - Above data can be found in Google Crome's developer tool

- How much additional memory your server (or browser) uses to aggregate the data?

  - ~1.26 MB
  - Above value can be derived by substract heapUsed before and after the data aggregation in Node
  - Code

    ```
    let used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`The script uses approximately ${used} MB`);
    const result = await Order.getTotalRevenue();
    result.color_count = await Order.getColorCount();
    result.price_quantity = await Order.getPriceQuantity();
    result.top5Products = await Order.getTop5Products();
    used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`The script uses approximately ${used} MB`);
    ```

  - console.log

    ```
    The script uses approximately 26.859588623046875 MB
    The script uses approximately 28.11566162109375 MB
    ```

- How much data do you transfer through the network? (Be careful about browser cache, you should measure it without browser cache)

  - Around 1.6MB. plotly.js alone uses 1.1MB

- Improvement on performance

  - Use cache to speed up the data aggregation but it only helps when there's no new coming order (Not yet implemented)
  - Defer the loading of plotly.js so that it won't block the data aggregation
  - Add compression middleware to compress the response body
    - It can reduces the size of response body from ~500kB to ~40kB
    - It also reduces the time to download response body to improve the runtime to get data from server (953ms to 450ms)
