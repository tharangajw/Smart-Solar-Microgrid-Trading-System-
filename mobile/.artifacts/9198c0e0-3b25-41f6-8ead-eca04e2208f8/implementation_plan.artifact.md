# Implementation Plan - Fix Solar Station Map and Splash Screen UI

This plan addresses two main issues reported:
1.  **Solar Station Map Not Showing Properly:** Markers or the map itself are not displaying correctly in the mobile app (both Prosumer and Operator roles), despite working on the web.
2.  **Launcher/Splash Screen UI Issue:** The UI shows artifacts or appears incorrectly before the onboarding screen.

## User Review Required

> [!IMPORTANT]
> The Map issue is likely caused by the backend API returning a wrapped response (e.g., `{ "data": [...] }`) which the current Android code doesn't handle, or a case-sensitivity mismatch in the endpoint URL.
>
> Also, ensure the **Google Maps API Key** is unrestricted or correctly restricted to the `applicationId` `sliit.ead.smartsolarmicrogrid`.

## Proposed Changes

### 1. Data & Networking

#### [MODIFY] [ApiClient.kt](file:///D:/4thyear/Smart-Solar-Microgrid-Trading-System-/mobile/app/src/main/java/com/smartsolar/data/remote/ApiClient.kt)
- Add a helper to handle emulator-specific IP addresses (`10.0.2.2`) if needed, ensuring the backend is reachable during development.

### 2. Map Module

#### [MODIFY] [StationMapActivity.kt](file:///D:/4thyear/Smart-Solar-Microgrid-Trading-System-/mobile/app/src/main/java/com/smartsolar/modules/map/StationMapActivity.kt)
- **Robust Parsing:** Update `loadStationsFromApi` to handle both direct `JSONArray` responses and wrapped `JSONObject` responses (e.g., `{ "data": [...] }`).
- **Endpoint Consistency:** Change the endpoint to match the backend expectation (checking for both `stations` and `Stations`).
- **Threading:** Remove `StrictMode` network usage and move the API call to a background thread to prevent UI freezing.
- **Markers:** Ensure markers are only added if valid coordinates exist.

### 3. Splash & Onboarding

#### [MODIFY] [SplashActivity.kt](file:///D:/4thyear/Smart-Solar-Microgrid-Trading-System-/mobile/app/src/main/java/com/smartsolar/modules/splash/SplashActivity.kt)
- **Full-Screen UI:** Set the activity to full screen to prevent "behind UI" artifacts (system status/nav bars) from showing during the splash animation.
- **Smooth Transition:** Ensure the transition to `OnboardingActivity` is seamless.

#### [MODIFY] [themes.xml](file:///D:/4thyear/Smart-Solar-Microgrid-Trading-System-/mobile/app/src/main/res/values/themes.xml)
- Create a dedicated `Theme.SmartSolarMicrogrid.Splash` that hides system bars by default for a cleaner startup experience.

## Verification Plan

### Automated Tests
- N/A (UI and Network dependent)

### Manual Verification
1.  **Map Check:** Open the Map from both Prosumer and Operator dashboards. Verify that markers appear correctly and the map centers on the stations (or Sri Lanka by default).
2.  **Splash Check:** Restart the app and verify the splash screen covers the entire screen without showing the previous activity or system bars flickering behind it.
3.  **Onboarding Check:** Verify that after the splash, it correctly navigates to the onboarding screen.
