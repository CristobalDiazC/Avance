CREATE DATABASE  IF NOT EXISTS `libreria` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `libreria`;

-- DROP DATABASE libreria;
-- CREATE DATABASE libreria;

-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: libreria
-- Ver Tablas
-- DESCRIBE inventario_pv;
-- DESCRIBE inventario_libros;


-- Show Tables;
-- select * from inventario_libros;
-- select * from inventario_pv;
-- select * from libros;
-- select * from movimientos_libros;
-- select * from papel;
-- select * from puntos_venta;
-- select * from usuarios;

INSERT INTO papel (paginas, nombre, stock_paginas)
VALUES (1, 'Papel estándar', 10000);


-- AGREGADO POR ROBERTO
-- UPDATE usuarios
-- SET contrasena = 'admin'
-- WHERE email = 'admin@admin.com';

-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `inventario_libros`
--

DROP TABLE IF EXISTS `inventario_libros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario_libros` (
  `id_inventario` int NOT NULL AUTO_INCREMENT,
  `libro_id` int NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_inventario`),
  KEY `libro_id` (`libro_id`),
  CONSTRAINT `inventario_libros_ibfk_1` FOREIGN KEY (`libro_id`) REFERENCES `libros` (`id_libro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario_libros`
--

/*!40000 ALTER TABLE `inventario_libros` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventario_libros` ENABLE KEYS */;

--
-- Table structure for table `libros`
--

DROP TABLE IF EXISTS `libros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `libros` (
  `id_libro` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `categoria` varchar(100) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_spanish2_ci,
  `precio` decimal(10,2) DEFAULT NULL,
  `paginas_por_libro` int NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_libro`),
  KEY `paginas_por_libro` (`paginas_por_libro`),
  CONSTRAINT `libros_ibfk_1` FOREIGN KEY (`paginas_por_libro`) REFERENCES `papel` (`paginas`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `libros`
--

/*!40000 ALTER TABLE `libros` DISABLE KEYS */;
/*!40000 ALTER TABLE `libros` ENABLE KEYS */;

--
-- Table structure for table `movimientos_libros`
--

DROP TABLE IF EXISTS `movimientos_libros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos_libros` (
  `id_mov_libro` int NOT NULL AUTO_INCREMENT,
  `inventario_id` int NOT NULL,
  `tipo` enum('entrada','salida','venta','ajuste') COLLATE utf8mb4_spanish2_ci NOT NULL,
  `cantidad` int NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `fecha_movimiento` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `observaciones` text COLLATE utf8mb4_spanish2_ci,
  PRIMARY KEY (`id_mov_libro`),
  KEY `inventario_id` (`inventario_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `movimientos_libros_ibfk_1` FOREIGN KEY (`inventario_id`) REFERENCES `inventario_libros` (`id_inventario`),
  CONSTRAINT `movimientos_libros_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_libros`
--

/*!40000 ALTER TABLE `movimientos_libros` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimientos_libros` ENABLE KEYS */;

--
-- Table structure for table `papel`
--

DROP TABLE IF EXISTS `papel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `papel` (
  `paginas` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `stock_paginas` int NOT NULL,
  PRIMARY KEY (`paginas`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `papel`
--

/*!40000 ALTER TABLE `papel` DISABLE KEYS */;
/*!40000 ALTER TABLE `papel` ENABLE KEYS */;

--
-- Table structure for table `puntos_venta`
--

DROP TABLE IF EXISTS `puntos_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `puntos_venta` (
  `id_punto_venta` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `ubicacion` varchar(150) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `tipo` enum('tienda','metro','online') COLLATE utf8mb4_spanish2_ci NOT NULL,
  PRIMARY KEY (`id_punto_venta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `puntos_venta`
--

/*!40000 ALTER TABLE `puntos_venta` DISABLE KEYS */;
/*!40000 ALTER TABLE `puntos_venta` ENABLE KEYS */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `contrasena` varchar(255) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `rol` enum('admin','vendedor') COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'vendedor',
  `punto_venta_id` int DEFAULT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`),
  KEY `punto_venta_id` (`punto_venta_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`punto_venta_id`) REFERENCES `puntos_venta` (`id_punto_venta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;



--
-- Dumping data for table `usuarios`
--

/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

CREATE TABLE inventario_pv (
    id_inventario INT NOT NULL AUTO_INCREMENT,
    id_libro INT NOT NULL,
    id_punto_venta INT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 5,
    
    PRIMARY KEY (id_inventario),

    UNIQUE KEY uk_libro_pv (id_libro, id_punto_venta),

    KEY fk_pv_libro (id_libro),
    KEY fk_pv_punto (id_punto_venta),

    CONSTRAINT fk_inventario_pv_libro
        FOREIGN KEY (id_libro)
        REFERENCES libros (id_libro)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_inventario_pv_punto
        FOREIGN KEY (id_punto_venta)
        REFERENCES puntos_venta (id_punto_venta)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;



-- Dump completed on 2025-11-08 14:11:31

-- Crear admin y user de prueba.
INSERT INTO usuarios (nombre, email, contrasena, rol, punto_venta_id)
VALUES ('Administrador General', 'admin@admin.com', 'admin', 'admin', NULL);
INSERT INTO usuarios (nombre, email, contrasena, rol, punto_venta_id)
VALUES ('Vendedor Prueba', 'user@user.com', 'user123', 'vendedor', NULL);

-- Crear Puntos de Venta Conocidos

-- INSERT INTO puntos_venta (nombre, ubicacion, tipo)
-- VALUES ('Librería Chile España', 'Chile España', 'metro');
-- Insetar papel
INSERT INTO papel (paginas, nombre, stock_paginas)
VALUES (100, 'Papel estándar 100 páginas', 10000);

-- Insertar libro
INSERT INTO libros (nombre, categoria, descripcion, precio, paginas_por_libro)
VALUES (
    'Cien Años de Soledad',
    'Ficción',
    'Novela clásica de Gabriel García Márquez.',
    12990,
    100
);
INSERT INTO libros (nombre, categoria, descripcion, precio, paginas_por_libro)
VALUES (
    'Cien citas junto a ti',
    'Ficción',
    'Novela clásica de Gabriel García Márquez.',
    14990,
    100
);

INSERT INTO inventario_pv (id_libro, id_punto_venta, stock)
VALUES (13, 2, 20);
UPDATE inventario_pv
SET stock = stock + 20
WHERE id_libro = 13 AND id_punto_venta = 2;


select * from inventario_pv;
SELECT * FROM libros;

SELECT id_usuario, nombre, rol, punto_venta_id
FROM usuarios;

SELECT id_usuario, nombre, email, contrasena, punto_venta_id 
FROM usuarios;


CREATE TABLE materias_primas (
  id_mp INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  unidad VARCHAR(50) NOT NULL,
  stock_actual INT NOT NULL DEFAULT 0,
  stock_minimo INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id_mp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;


CREATE TABLE movimientos_mp (
  id_mov_mp INT NOT NULL AUTO_INCREMENT,
  mp_id INT NOT NULL,
  tipo ENUM('entrada','salida','ajuste') NOT NULL,
  cantidad INT NOT NULL,
  usuario_id INT DEFAULT NULL,
  fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  observaciones TEXT,
  PRIMARY KEY (id_mov_mp),
  FOREIGN KEY (mp_id) REFERENCES materias_primas(id_mp),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
