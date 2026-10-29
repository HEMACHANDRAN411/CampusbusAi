"""
CampusBus AI - Phase 1 Rule-Based Chatbot with Tanglish & English Support
Extracts intents and entities (bus number, stop name, query type) without expensive external APIs.
"""

import re
from typing import Dict, Any, Optional
from .data import get_all_buses, get_all_routes, get_bus_by_number, find_buses_by_stop_name

# Common greetings in English and Tanglish
GREETING_WORDS = {
    "hi", "hello", "hey", "vanakkam", "vanakam", "kaalai vanakkam",
    "good morning", "good evening", "namaste", "hola", "start"
}

# Tanglish query indicators
WHERE_WORDS = {"where", "enge", "enga", "engu", "location", "track", "position", "irukku"}
WHEN_WORDS = {"when", "eppo", "eppa", "varum", "reach", "time", "timing", "neram", "eta"}
WHICH_WORDS = {"which", "entha", "yentha"}

def extract_bus_number(text: str) -> Optional[str]:
    """Extracts bus number like '12', '07', '24' from query."""
    match = re.search(r'\b(?:bus\s*#?|b\s*)?(\d{1,3})\b', text.lower())
    if match:
        return match.group(1)
    return None

def process_chat_message(raw_message: str) -> str:
    """Main conversational rule-based engine."""
    if not raw_message or not raw_message.strip():
        return "👋 Vanakkam! Please type a question, like 'Where is bus 12?' or 'Chromepet bus'."

    msg = raw_message.strip().lower()
    
    # 1. Greetings
    if any(w in msg.split() for w in GREETING_WORDS) and len(msg.split()) <= 3:
        return (
            "🙏 **Vanakkam! Welcome to CampusBus AI Student Assistant.**\n\n"
            "I can help you track buses, check schedules, and see routes in English or Tanglish.\n\n"
            "💡 **Try asking:**\n"
            "• `Where is Bus 12?` (or `Bus 12 enge?`)\n"
            "• `When will Bus 7 arrive?` (or `Bus 7 eppo varum?`)\n"
            "• `Which bus goes to Chromepet?` (or `Chromepet entha bus?`)\n"
            "• `List all buses`"
        )

    # 2. Extract potential bus number
    bus_num = extract_bus_number(msg)

    # 3. Check for specific bus queries (Location vs Arrival vs General Status)
    if bus_num:
        bus = get_bus_by_number(bus_num)
        if bus:
            # Check if asking when / ETA
            if any(w in msg for w in WHEN_WORDS):
                return (
                    f"⏰ **Bus {bus['bus_number']} Timing & Arrival:**\n\n"
                    f"• **Status:** {bus['status_label']}\n"
                    f"• **Next Stop:** {bus['next_stop_name']} in **~{bus['eta_next_stop_mins']} mins**\n"
                    f"• **ETA to College Campus:** **~{bus['eta_campus_mins']} mins**\n"
                    f"• **Current Speed:** {bus['speed_kmh']} km/h\n"
                    f"• **Driver:** {bus['driver_name']} ({bus['driver_phone']})"
                )
            
            # Default to location/status if bus number is present
            return (
                f"🚌 **Live Status for Bus {bus['bus_number']} ({bus['plate_number']}):**\n\n"
                f"• **Route:** {bus['route_name']}\n"
                f"• **Current Location:** {bus['current_location_desc']}\n"
                f"• **Speed:** {bus['speed_kmh']} km/h | **Heading:** {bus['heading']}°\n"
                f"• **Condition:** {bus['status_label']} (Ping {bus['last_ping']})\n"
                f"• **Next Stop:** {bus['next_stop_name']} (ETA: {bus['eta_next_stop_mins']} mins)\n"
                f"• **Campus ETA:** ~{bus['eta_campus_mins']} mins"
            )
        else:
            return (
                f"⚠️ Bus **#{bus_num}** was not found in today's active fleet.\n"
                f"Currently active buses are: **Bus 12, Bus 07, Bus 24**."
            )

    # 4. Check for stop name search (e.g. "which bus to chromepet", "tambaram bus enge", "vadapalani")
    for stop_candidate in ["tambaram", "chromepet", "pallavaram", "koyambedu", "vadapalani", "ashok pillar", "velachery", "taramani", "madhya kailash", "saidapet"]:
        if stop_candidate in msg:
            matching_buses = find_buses_by_stop_name(stop_candidate)
            if matching_buses:
                lines = [f"📍 **Buses serving '{stop_candidate.title()}':**\n"]
                for b in matching_buses:
                    lines.append(
                        f"• **Bus {b['bus_number']}** ({b['route_name']}) — "
                        f"Status: {b['status_label']}, Next: {b['next_stop_name']}"
                    )
                return "\n".join(lines)
            else:
                return f"🔍 No active buses currently assigned to stop '{stop_candidate.title()}'."

    # 5. List all buses query
    if any(k in msg for k in ["all buses", "bus list", "show buses", "buses", "fleet"]):
        buses = get_all_buses()
        lines = ["📋 **Today's Active Campus Bus Fleet:**\n"]
        for b in buses:
            lines.append(
                f"• **Bus {b['bus_number']}** ({b['route_name']})\n"
                f"  Status: {b['status_label']} | Driver: {b['driver_name']}\n"
                f"  Near: {b['current_location_desc']} (ETA Campus: {b['eta_campus_mins']}m)\n"
            )
        return "\n".join(lines)

    # 6. List all routes
    if any(k in msg for k in ["route", "routes", "stops", "timetable"]):
        routes = get_all_routes()
        lines = ["🗺️ **Available Bus Routes:**\n"]
        for r in routes:
            stops_str = " ➔ ".join([s["name"] for s in r["stops"]])
            lines.append(f"**{r['route_number']}: {r['name']}**\n{stops_str}\n")
        return "\n".join(lines)

    # 7. Fallback response with helpful hints
    return (
        "🤔 I couldn't quite understand that query.\n\n"
        "Here are quick examples you can ask:\n"
        "• `Where is bus 12?` / `Bus 12 enga irukku?`\n"
        "• `Bus 7 timing` / `Bus 7 eppo varum?`\n"
        "• `Pallavaram stop entha bus?`\n"
        "• `List all buses` or `Show routes`"
    )
