
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `artboards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `artboards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT 'Untitled Artboard',
  `width_inches` decimal(8,2) DEFAULT '8.50',
  `height_inches` decimal(8,2) DEFAULT '11.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_artboards_user_id` (`user_id`),
  CONSTRAINT `fk_artboards_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `color_combinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `color_combinations` (
  `combination_id` int NOT NULL AUTO_INCREMENT,
  `pigment1_id` int NOT NULL,
  `pigment2_id` int NOT NULL,
  `pigment3_id` int DEFAULT NULL,
  `pigment4_id` int DEFAULT NULL,
  `pigment5_id` int DEFAULT NULL,
  `ratio1` int NOT NULL,
  `ratio2` int NOT NULL,
  `ratio3` int DEFAULT NULL,
  `ratio4` int DEFAULT NULL,
  `ratio5` int DEFAULT NULL,
  `total_ratio` int NOT NULL,
  `result_r` int NOT NULL,
  `result_g` int NOT NULL,
  `result_b` int NOT NULL,
  `color_hex` varchar(7) NOT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`combination_id`),
  KEY `pigment1_id` (`pigment1_id`),
  KEY `pigment2_id` (`pigment2_id`),
  KEY `pigment3_id` (`pigment3_id`),
  KEY `pigment4_id` (`pigment4_id`),
  KEY `pigment5_id` (`pigment5_id`),
  KEY `idx_color_combinations_user_id` (`user_id`),
  CONSTRAINT `color_combinations_ibfk_1` FOREIGN KEY (`pigment1_id`) REFERENCES `pigments` (`pigment_id`),
  CONSTRAINT `color_combinations_ibfk_2` FOREIGN KEY (`pigment2_id`) REFERENCES `pigments` (`pigment_id`),
  CONSTRAINT `color_combinations_ibfk_3` FOREIGN KEY (`pigment3_id`) REFERENCES `pigments` (`pigment_id`),
  CONSTRAINT `color_combinations_ibfk_4` FOREIGN KEY (`pigment4_id`) REFERENCES `pigments` (`pigment_id`),
  CONSTRAINT `color_combinations_ibfk_5` FOREIGN KEY (`pigment5_id`) REFERENCES `pigments` (`pigment_id`),
  CONSTRAINT `fk_color_combinations_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `artboard_id` int DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `artboard_width_inches` decimal(8,2) DEFAULT '8.50',
  `artboard_height_inches` decimal(8,2) DEFAULT '11.00',
  `image_x` decimal(10,2) DEFAULT '0.00',
  `image_y` decimal(10,2) DEFAULT '0.00',
  `image_width` decimal(10,2) DEFAULT NULL,
  `image_height` decimal(10,2) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `artboard_id` (`artboard_id`),
  KEY `idx_images_user_id` (`user_id`),
  CONSTRAINT `fk_images_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
  CONSTRAINT `images_ibfk_1` FOREIGN KEY (`artboard_id`) REFERENCES `artboards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `level` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `context` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pigment_mix_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pigment_mix_details` (
  `detail_id` int NOT NULL AUTO_INCREMENT,
  `mix_id` int NOT NULL,
  `pigment_id` int NOT NULL,
  `parts` int NOT NULL,
  `percentage` decimal(5,2) NOT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`detail_id`),
  KEY `mix_id` (`mix_id`),
  KEY `pigment_id` (`pigment_id`),
  KEY `idx_pigment_mix_details_user_id` (`user_id`),
  CONSTRAINT `fk_pigment_mix_details_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pigment_mix_details_ibfk_1` FOREIGN KEY (`mix_id`) REFERENCES `pigment_mixes` (`mix_id`),
  CONSTRAINT `pigment_mix_details_ibfk_2` FOREIGN KEY (`pigment_id`) REFERENCES `pigments` (`pigment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4184 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pigment_mixes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pigment_mixes` (
  `mix_id` int NOT NULL AUTO_INCREMENT,
  `type` enum('virtual','analog') NOT NULL,
  `final_rgb` varchar(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`mix_id`),
  KEY `idx_pigment_mixes_user_id` (`user_id`),
  CONSTRAINT `fk_pigment_mixes_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1407 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pigments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pigments` (
  `pigment_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `color_hex` varchar(7) NOT NULL,
  `r` int NOT NULL,
  `g` int NOT NULL,
  `b` int NOT NULL,
  `type` enum('Base','White','Black','Tint') NOT NULL,
  `description` text,
  `user_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`pigment_id`),
  KEY `idx_pigments_user_id` (`user_id`),
  CONSTRAINT `fk_pigments_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session` (
  `id` varchar(255) NOT NULL,
  `expires_at` bigint NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session_user_id` (`user_id`),
  CONSTRAINT `session_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `swatches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `swatches` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `hex_color` varchar(7) NOT NULL,
  `red` int NOT NULL,
  `green` int NOT NULL,
  `blue` int NOT NULL,
  `cmyk` varchar(25) DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `image_id` int DEFAULT NULL,
  `artboard_id` int DEFAULT NULL,
  `pos_x` int DEFAULT '0',
  `pos_y` int DEFAULT '0',
  `sample_x` int DEFAULT '0',
  `sample_y` int DEFAULT '0',
  `sample_size` int DEFAULT '1',
  `user_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `image_id` (`image_id`),
  KEY `artboard_id` (`artboard_id`),
  KEY `idx_swatches_user_id` (`user_id`),
  CONSTRAINT `fk_swatches_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
  CONSTRAINT `swatches_ibfk_1` FOREIGN KEY (`image_id`) REFERENCES `images` (`id`),
  CONSTRAINT `swatches_ibfk_2` FOREIGN KEY (`artboard_id`) REFERENCES `artboards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=257 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `hashed_password` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

