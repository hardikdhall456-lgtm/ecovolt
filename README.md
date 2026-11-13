# EcoVolt.ai – Smart Home Energy Consumption Analytics Dashboard

> **MCA Final-Year Capstone Project Prototype**  
> An explainable, data-driven decision-support system for residential electricity monitoring, appliance load submetering, multi-tier electricity bill simulation, and carbon footprint reduction.

---

## 1. Project Abstract
**EcoVolt.ai** is an academic prototype of an energy consumption analytics dashboard engineered with React, TypeScript, Tailwind CSS, and Recharts. The application models household electricity dynamics by tracking whole-house energy consumption curves, calculating individual appliance submetering burdens from nominal wattage ratings, modeling telescopic slab electricity tariffs, and converting kilowatt-hours into equivalent carbon emissions ($\text{kg CO}_2$). Furthermore, it features an explainable, rule-based recommendation engine that identifies electrical wastage and offers actionable steps to reduce consumer utility expenditure.

---

## 2. Problem Statement
Modern residential consumers receive monthly utility bills that present a single, aggregated monetary figure without granular insight into:
- The energy distribution across individual heavy-load appliances (such as air conditioners, water geysers, and refrigerators).
- The financial impact of crossing telescopic tariff slab thresholds.
- Continuous vampiric standby loads during off-peak and sleep hours.
- The greenhouse gas ($\text{CO}_2$) footprint tied directly to household power draw.

This absence of transparent telemetry prevents consumers from adopting effective conservation habits.

---

## 3. Objectives
1. **Appliance-Level Submetering:** Derive appliance consumption and cost dynamically using nominal active wattage ($W$), daily operational hours ($h$), and monthly operating days.
2. **Interactive Time-Series Analytics:** Visualize 30-day continuous consumption curves, period-over-period comparisons, and 24-hour diurnal load profiles.
3. **Transparent Bill Simulation:** Implement both flat-rate and telescopic slab tariff models with fixed demand charges and statutory duty taxes.
4. **Predictive Load Forecasting:** Extrapolate future 7-day consumption trajectories using linear least-squares regression ($y = mx + b$).
5. **Rule-Based Energy Optimization:** Provide explainable prescriptive recommendations with quantified rupee ($\text{₹}$) and $\text{kWh}$ savings.
6. **Carbon Footprint Tracking:** Convert energy metrics into kilograms of $\text{CO}_2$ using Central Electricity Authority (CEA) grid baseline factors.

---

## 4. Scope and Limitations
- **Academic Simulation Scope:** The prototype uses reproducible, synthetic residential time-series data designed to emulate real-world consumption patterns (including weekday/weekend shifts and diurnal morning/evening peaks).
- **Physical Meter Ingestion Limitation:** The project does not claim physical IoT smart meter hardware integration. In a real-world enterprise deployment, live telemetry would be gathered via CT clamp sensors, Zigbee/Matter protocols, or Modbus smart meters into an MQTT broker.
- **Explainable Heuristics:** Recommendations rely on transparent engineering formulas and Bureau of Energy Efficiency (BEE) guidelines rather than opaque machine-learning models.

---

## 5. Technology Stack
- **Frontend Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling & Design System:** Tailwind CSS v4 (navy SaaS aesthetic, emerald/teal accents, responsive drawer navigation)
- **Data Visualization:** Recharts (Area charts, Bar charts, Line charts, Donut charts)
- **Iconography:** Lucide React
- **Client Persistence:** HTML5 Web Storage (`localStorage`) for appliances, tariffs, and threshold persistence

---

## 6. System Architecture & Data Flow

```
+------------------------------------------------------------------+
|                    ECOVOLT ARCHITECTURE PIPELINE                 |
+------------------------------------------------------------------+
                                  |
                                  v
+-------------------+     +------------------+     +----------------+
| User Config &     |     | Synthetic 30-Day |     | Appliance      |
| Custom Tariffs    |     | Time-Series Data |     | Specifications |
+-------------------+     +------------------+     +----------------+
          \                        |                       /
           \                       |                      /
            v                      v                     v
   +-------------------------------------------------------------+
   |                CORE CALCULATION UTILITIES ENGINE            |
   |                                                             |
   |  * Submetering: E = (W × h × d) / 1000                     |
   |  * Telescopic Slabs: Slab 1 + Slab 2 + Slab 3 + Duty%       |
   |  * Carbon: CO2 = Total kWh × 0.82 kg/kWh                    |
   |  * Trend Forecast: Ordinary Least-Squares (y = mx + b)      |
   |  * Efficiency Scoring: (0 - 100 Index)                      |
   +-------------------------------------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                       PRESENTATION LAYER                    |
   |                                                             |
   |  [Overview]        KPI Cards, Efficiency Score, 24h Profile |
   |  [Analytics]       Comparative Trend, Category Bar, CSV     |
   |  [Appliances]      Full CRUD, Search, Wattage Formulas      |
   |  [Bill Simulator]  Slab Breakdown, Run-Rate Forecasts       |
   |  [Recommendations] Rule-Based Actions & Adoption Tracking   |
   |  [Settings]        Tariff Defaults, CO2 Factors, Reset      |
   +-------------------------------------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                    HTML5 LOCAL STORAGE                      |
   |             (Persists across browser refreshes)             |
   +-------------------------------------------------------------+
```

---

## 7. Mathematical Formulas

### A. Individual Appliance Electrical Consumption
$$\text{Energy (kWh)} = \frac{\text{Power (Watts)} \times \text{Daily Hours (h)} \times \text{Operating Days}}{1000}$$

$$\text{Monthly Appliance Cost (₹)} = \text{Energy (kWh)} \times \text{Tariff Rate (₹/kWh)}$$

### B. Telescopic Slab Tariff Model
$$\text{Energy Charges} = \sum_{i=1}^{k} \left( \text{Units}_{\text{slab}_i} \times \text{Rate}_{\text{slab}_i} \right)$$
- **Slab 1 (0 – 100 kWh):** $\text{Base Rate}$ (e.g. ₹7.50/kWh)
- **Slab 2 (101 – 300 kWh):** $\text{Base Rate} \times 1.30$ (₹9.75/kWh)
- **Slab 3 (> 300 kWh):** $\text{Base Rate} \times 1.65$ (₹12.38/kWh)

$$\text{Duty / Tax} = (\text{Energy Charges} + \text{Fixed Overhead}) \times \frac{\text{Tax}\%}{100}$$

$$\text{Total Bill} = \text{Energy Charges} + \text{Fixed Overhead} + \text{Duty}$$

### C. Greenhouse Gas Carbon Footprint
$$\text{Emissions (kg CO}_2) = \text{Total Energy (kWh)} \times 0.82\text{ kg CO}_2/\text{kWh}$$
*(Baseline emission factor grounded in the Central Electricity Authority of India national carbon register)*.

### D. Ordinary Least-Squares (OLS) Trend Forecasting
$$y = mx + b$$
$$m = \frac{n\sum(xy) - \sum x \sum y}{n\sum(x^2) - (\sum x)^2}, \quad b = \frac{\sum y - m\sum x}{n}$$

---

## 8. Main Application Modules

1. **Overview Dashboard:**
   - 5 Summary KPI cards: Total consumption (kWh), Estimated bill (₹), Daily average (kWh), Period-over-period variance (%), and Carbon footprint ($\text{kg CO}_2$).
   - Efficiency score gauge (0–100) with diagnostic ratings.
   - Peak consumption period indicator & top consumer callout.
   - Dynamic threshold alerts.
   - 30-day interactive area chart & appliance category donut chart.
   - 24-hour diurnal load profile bar chart.

2. **Energy Analytics:**
   - Date range selector (7, 14, 30 days).
   - Comparative line chart overlaying current vs. previous month.
   - 7-day linear regression forecasting extrapolation.
   - Category-filtered and sorted appliance load distribution.
   - One-click CSV dataset export.

3. **Appliance Management:**
   - Real-time Add / Edit / Delete modal CRUD.
   - Category tagging (HVAC, Refrigeration, Water Heating, Lighting, Entertainment, Kitchen, Laundry, Other).
   - Live dynamic calculation previews inside modals.
   - Filter and search bar by name and room location.

4. **Electricity Bill Calculator:**
   - Interactive slider and numeric inputs for consumption scenarios.
   - Configurable base tariff, fixed charges, and duty percentages.
   - Telescopic slab vs. flat-rate toggle.
   - Projected month-end run rate based on recent 7-day velocity.
   - Itemized, transparent cost breakdown table.

5. **Smart Recommendations Engine:**
   - Prescriptive rules addressing HVAC thermostat setpoints, water heater cycling, standby vampire loads, and lighting daylight harvesting.
   - Transparent display of why each rule was generated and its underlying physical assumptions.
   - Interactive "Adopt Measure" button that accumulates verified monthly savings.

6. **System Settings & Viva Documentation:**
   - Household profile customization.
   - Configurable electricity tariff and grid emission factors.
   - Anomaly threshold settings.
   - Reset button to restore default reproducible demo data.
   - In-app MCA Viva Examination modal.

---

## 9. Installation and Execution

### Prerequisites
- Node.js (v18.0 or later)
- npm (v9.0 or later)

### Steps
```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build for production distribution
npm run build

# 4. Preview production build
npm run preview
```

---

## 10. Testing & Validation Approach
- **Mathematical Consistency Verification:** The submeter sum total, dashboard KPI cards, analytics series, and bill calculator draw from unified calculation utilities, ensuring 100% numerical consistency across views.
- **Boundary Condition Testing:** Input fields for wattage, hours (0.1–24h), days (1–31d), and tariffs handle extreme values without application crashes.
- **State Persistence Verification:** Tests confirmed that user-added appliances, tariff adjustments, and threshold changes survive page reloads via `localStorage`.

---

## 11. Future Enhancements
- Hardware CT clamp integration via ESP32 microcontrollers transmitting over MQTT.
- Time-of-Day (ToD) tariff support with dynamically shifting peak/off-peak pricing.
- Solar photovoltaic (PV) generation and net-metering integration.
- Mobile push notifications for real-time anomaly alerts.
