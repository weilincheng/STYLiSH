CREATE DATABASE stylish;
USE stylish;

-- Drop Tables
drop table size;
drop table color; 
drop table image;
drop table variant; 
drop table product;

-- create product table
CREATE TABLE product(
    id BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    category VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    price DECIMAL(10) NOT NULL DEFAULT 0,
    texture VARCHAR(255) NOT NULL,
    wash VARCHAR(255) NOT NULL,
    place VARCHAR(255) NOT NULL,
    note VARCHAR(255) NOT NULL,
    story VARCHAR(255) NOT NULL,
    main_image VARCHAR(255) NULL,
    PRIMARY KEY(id)
);
-- create color table
CREATE TABLE color(
    id BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL, 
    code VARCHAR(10) NOT NULL,
    name VARCHAR(10) NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);

-- create size table
CREATE TABLE size(
    id BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL, 
    size VARCHAR(10) NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);

-- create variant table
CREATE TABLE variant(
    id BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL, 
    color_code VARCHAR(10) NOT NULL,
    size VARCHAR(10) NOT NULL,
    stock INT NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);

-- create image table
CREATE TABLE image(
    id BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL, 
    image VARCHAR(255) NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);

INSERT INTO product
    (category, title, description, price, texture, wash, place, note, story, main_image) 
VALUES 
    ('men', '厚實毛呢格子外套', '高抗寒素材選用，保暖也時尚有型', 2200, '棉、聚脂纖維', '手洗（水溫40度)', '韓國', '實品顏色以單品照為主', '你絕對不能錯過的超值商品', 'main.jpg');

INSERT INTO product
    (category, title, description, price, texture, wash, place, note, story, main_image) 
VALUES 
    ('men', '厚實毛呢格子外套', '高抗寒素材選用，保暖也時尚有型', 3200, '棉、聚脂纖維', '手洗（水溫50度)', '日本', '實品顏色以單品照為主', '你絕對不能錯過的超值商品', 'main.jpg');

INSERT INTO color(product_id, code, name) VALUES (1, '#000000', '黑色');
INSERT INTO color(product_id, code, name) VALUES (1, '334455', '深藍');
INSERT INTO size(product_id, size) VALUES (1, 'S');
INSERT INTO size(product_id, size) VALUES (1, 'M');
SELECT size FROM size WHERE product_id = 1;
INSERT INTO variant(product_id, color_code, size, stock) VALUES (1, '334455', 'S', 5);
INSERT INTO variant(product_id, color_code, size, stock) VALUES (1, '334455', 'M', 10);
SELECT color_code, size, stock from variant WHERE product_id = 1;
INSERT INTO image(product_id, image) VALUES (1, '0.jpg');
INSERT INTO image(product_id, image) VALUES (1, '1.jpg');
INSERT INTO image(product_id, image) VALUES (1, '2.jpg');
SELECT image FROM image WHERE product_id = 1;

-- Client does not support authentication protocol requested by server; consider upgrading MySQL client
ALTER USER 'weilin'@'localhost' IDENTIFIED WITH mysql_native_password BY '12345';
flush privileges;

-- Create user table
CREATE TABLE user(
    id BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    provider VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NULL,
    picture VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    PRIMARY KEY(id)
);

INSERT INTO user
    (provider, name, email, password, access_token, access_expired, picture) 
    VALUES 
    ('native', 'test', 'test@test.com', 'test', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6joiYXJ0aHVIjoxNjEzNTY3MzA0fQ.6EPCOfBGynidAfpVqlvbHGWHCJ5LZLtKvPaQ', '3600', 'https://memeprod.sgp1.digitaloceanspaces.com/user-wtf/1651029369980.jpg');


-- Create campaign table
CREATE TABLE campaign(
    id BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL, 
    picture VARCHAR(255) NOT NULL,
    story VARCHAR(255) NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);

-- Create order table
CREATE TABLE orders(
    id BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    shipping VARCHAR(255) NOT NULL,
    payment VARCHAR(255) NOT NULL,
    subtotal DECIMAL(10) NOT NULL DEFAULT 0,
    freight DECIMAL(10) NOT NULL DEFAULT 0,
    total DECIMAL(10) NOT NULL DEFAULT 0,
    recTradeId VARCHAR(255) NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- Create recipient table
CREATE TABLE recipient(
    id BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    time VARCHAR(55) NOT NULL,
    order_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Create list table
CREATE TABLE list(
    id BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10) NOT NULL,
    color_name VARCHAR(50) NOT NULL,
    color_code VARCHAR(50) NOT NULL,
    size VARCHAR(50) NOT NULL,
    qty INT NOT NULL, 
    PRIMARY KEY(id),
    order_id BIGINT UNSIGNED NOT NULL, 
    product_id BIGINT UNSIGNED NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);

INSERT INTO orders 
    (shipping, payment, subtotal, freight, total) 
    VALUES 
    ('delivery', 'credit_card', '1234', '14', '1300');

INSERT INTO recipient 
    (name, phone, email, address, time, order_id)
    VALUES 
    ('Luke', '0987654321', 'luke@gmail.com', '市政府站', 'morning', '1'); 

INSERT INTO list
    (name, price, color_name, color_code, size, qty, order_id, product_id)
    VALUES 
    ('活力花紋長筒牛仔褲', '1299', 'DDF0FF', '淺藍', 'S', '1', '1', '1');

INSERT INTO list
    (name, price, color_name, color_code, size, qty, order_id, product_id)
    VALUES 
    ('活力花紋長筒牛仔裙', '2299', 'DDF0FF', '淺藍', 'S', '1', '1', '2');

-- For mid-term
CREATE TABLE order_data(
    id BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    color_name VARCHAR(50) NOT NULL,
);