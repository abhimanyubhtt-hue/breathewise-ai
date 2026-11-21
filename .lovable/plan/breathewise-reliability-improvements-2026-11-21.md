# BreatheWise Reliability Improvements

## User-facing changes
- Preserve the current forest-green visual identity and all working pages.
- Derive hourly US AQI from valid pollutant concentrations, show the dominant pollutant, and distinguish US AQI from India's CPCB AQI.
- Show real weather readings when available, with separate loading, error, and unavailable states.
- Give Gemini the selected coordinates, current available readings, forecast provenance, and complete family preferences; preserve safe recovery on service failures.
- Validate family profile values and make the daily routine reflect activity, commute, family vulnerability, and forecast availability.
- Keep Green Impact estimates intact while documenting each emission factor and its assumptions.

## Technical approach
- Keep environmental calculations in the existing BreatheWise domain module and external data requests in the existing server function.
- Validate external responses and preserve missing values as null; use the existing authenticated server function for assistant calls and household data.
- Add focused tests for AQI breakpoints/dominant pollutant, planner decisions, and all displayed transport factors.
- Verify the preview's key workflows and mobile layout without changing unrelated pages or the established visual system.