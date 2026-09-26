# 📱 Smart Solar Microgrid Trading System - Android Mobile App

This directory contains the **Native Android (Kotlin)** mobile application for **Prosumers**, **EV Consumers**, and **Station Operators**.

For full project details, system architecture, and setup instructions, please see the **[Root README.md](../README.md)**.

---

## 🛠️ Technology Stack

- **Language**: Kotlin (JDK 21)
- **Target SDK**: Android SDK 35 (Min SDK 24)
- **UI Framework**: Material Design 3 (ViewBinding, ConstraintLayout, ViewPager2)
- **Maps**: Google Maps Android SDK (`play-services-maps`), Google Play Location Services
- **QR Engine**: ZXing Android Embedded library (`zxing-android-embedded`)
- **Concurrency**: Kotlin Coroutines (`kotlinx-coroutines-android`), Lifecycle Scope

---

## 🚀 Building & Running

1. Open Android Studio (Ladybug or newer).
2. Select **Open** and choose the `mobile/` directory.
3. Sync Gradle and run on an Android Emulator or connected physical device.
