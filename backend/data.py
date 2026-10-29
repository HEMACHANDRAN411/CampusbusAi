"""
CampusBus AI - Phase 1 Sample Hardcoded Data
Realistic college bus routes, stops, scheduled times, and simulated live bus positions in Chennai.
"""

from typing import List, Dict, Any, Optional

# Sample Campus Destination: Anna University Main Campus, Guindy, Chennai
CAMPUS_LOCATION = {
    "name": "College Main Gate (Campus)",
    "lat": 13.0109,
    "lng": 80.2354
}

ROUTES: List[Dict[str, Any]] = [
    {
        "id": "R1",
        "route_number": "Route 1",
        "name": "Tambaram to Campus Express",
        "color": "#2563eb",  # Blue
        "morning_departure": "07:15 AM",
        "arrival_campus": "08:25 AM",
        "stops": [
            {
                "id": "R1_S1",
                "name": "Tambaram Bus Stand",
                "lat": 12.9249,
                "lng": 80.1000,
                "scheduled_time": "07:15 AM",
                "order": 1
            },
            {
                "id": "R1_S2",
                "name": "Chromepet (MIT Gate)",
                "lat": 12.9516,
                "lng": 80.1406,
                "scheduled_time": "07:30 AM",
                "order": 2
            },
            {
                "id": "R1_S3",
                "name": "Pallavaram Bus Stop",
                "lat": 12.9675,
                "lng": 80.1491,
                "scheduled_time": "07:42 AM",
                "order": 3
            },
            {
                "id": "R1_S4",
                "name": "Kathipara Junction (Guindy)",
                "lat": 13.0067,
                "lng": 80.2023,
                "scheduled_time": "08:05 AM",
                "order": 4
            },
            {
                "id": "R1_S5",
                "name": "College Main Gate",
                "lat": 13.0109,
                "lng": 80.2354,
                "scheduled_time": "08:25 AM",
                "order": 5
            }
        ]
    },
    {
        "id": "R2",
        "route_number": "Route 2",
        "name": "Koyambedu to Campus Line",
        "color": "#16a34a",  # Green
        "morning_departure": "07:20 AM",
        "arrival_campus": "08:20 AM",
        "stops": [
            {
                "id": "R2_S1",
                "name": "Koyambedu CMBT",
                "lat": 13.0694,
                "lng": 80.1948,
                "scheduled_time": "07:20 AM",
                "order": 1
            },
            {
                "id": "R2_S2",
                "name": "Vadapalani Junction",
                "lat": 13.0500,
                "lng": 80.2121,
                "scheduled_time": "07:35 AM",
                "order": 2
            },
            {
                "id": "R2_S3",
                "name": "Ashok Pillar",
                "lat": 13.0336,
                "lng": 80.2117,
                "scheduled_time": "07:50 AM",
                "order": 3
            },
            {
                "id": "R2_S4",
                "name": "Saidapet Bridge",
                "lat": 13.0210,
                "lng": 80.2230,
                "scheduled_time": "08:05 AM",
                "order": 4
            },
            {
                "id": "R2_S5",
                "name": "College Main Gate",
                "lat": 13.0109,
                "lng": 80.2354,
                "scheduled_time": "08:20 AM",
                "order": 5
            }
        ]
    },
    {
        "id": "R3",
        "route_number": "Route 3",
        "name": "Velachery / OMR Coast Line",
        "color": "#d97706",  # Amber/Orange
        "morning_departure": "07:30 AM",
        "arrival_campus": "08:25 AM",
        "stops": [
            {
                "id": "R3_S1",
                "name": "Velachery MRTS Station",
                "lat": 12.9796,
                "lng": 80.2185,
                "scheduled_time": "07:30 AM",
                "order": 1
            },
            {
                "id": "R3_S2",
                "name": "Taramani (Ascendas)",
                "lat": 12.9863,
                "lng": 80.2432,
                "scheduled_time": "07:45 AM",
                "order": 2
            },
            {
                "id": "R3_S3",
                "name": "Madhya Kailash",
                "lat": 13.0063,
                "lng": 80.2520,
                "scheduled_time": "08:05 AM",
                "order": 3
            },
            {
                "id": "R3_S4",
                "name": "College Main Gate",
                "lat": 13.0109,
                "lng": 80.2354,
                "scheduled_time": "08:25 AM",
                "order": 4
            }
        ]
    }
]

BUSES: List[Dict[str, Any]] = [
    {
        "id": "B12",
        "bus_number": "12",
        "plate_number": "TN-09-CB-1212",
        "route_id": "R1",
        "route_name": "Tambaram to Campus Express",
        "driver_name": "Murugan K.",
        "driver_phone": "+91 98401 23456",
        "status": "on_time",           # on_time | delayed | signal_lost
        "status_label": "On Time",
        "current_lat": 12.9540,
        "current_lng": 80.1415,
        "speed_kmh": 36,
        "heading": 45,                  # Direction in degrees
        "last_ping": "15 seconds ago",
        "current_location_desc": "Near Chromepet MIT Gate",
        "next_stop_name": "Pallavaram Bus Stop",
        "eta_next_stop_mins": 6,
        "eta_campus_mins": 35
    },
    {
        "id": "B07",
        "bus_number": "07",
        "plate_number": "TN-09-CB-0707",
        "route_id": "R2",
        "route_name": "Koyambedu to Campus Line",
        "driver_name": "Senthil Kumar",
        "driver_phone": "+91 98402 34567",
        "status": "delayed",
        "status_label": "Delayed (6 mins)",
        "current_lat": 13.0485,
        "current_lng": 80.2125,
        "speed_kmh": 22,
        "heading": 170,
        "last_ping": "25 seconds ago",
        "current_location_desc": "Crossing Vadapalani Junction traffic",
        "next_stop_name": "Ashok Pillar",
        "eta_next_stop_mins": 9,
        "eta_campus_mins": 32
    },
    {
        "id": "B24",
        "bus_number": "24",
        "plate_number": "TN-09-CB-2424",
        "route_id": "R3",
        "route_name": "Velachery / OMR Coast Line",
        "driver_name": "Rajesh P.",
        "driver_phone": "+91 98403 45678",
        "status": "on_time",
        "status_label": "On Time",
        "current_lat": 12.9890,
        "current_lng": 80.2445,
        "speed_kmh": 40,
        "heading": 15,
        "last_ping": "10 seconds ago",
        "current_location_desc": "Passing Taramani Ascendas IT Park",
        "next_stop_name": "Madhya Kailash",
        "eta_next_stop_mins": 8,
        "eta_campus_mins": 22
    }
]

def get_all_routes() -> List[Dict[str, Any]]:
    return ROUTES

def get_route_by_id(route_id: str) -> Optional[Dict[str, Any]]:
    for route in ROUTES:
        if route["id"].lower() == route_id.lower() or route["route_number"].lower() == route_id.lower():
            return route
    return None

def get_all_buses() -> List[Dict[str, Any]]:
    return BUSES

def get_bus_by_number(bus_number: str) -> Optional[Dict[str, Any]]:
    clean = bus_number.strip().lower().replace("bus", "").replace("#", "").strip()
    for bus in BUSES:
        if bus["bus_number"].lower() == clean or bus["bus_number"].lstrip("0") == clean.lstrip("0"):
            return bus
    return None

def find_buses_by_stop_name(query_stop: str) -> List[Dict[str, Any]]:
    query_stop = query_stop.lower().strip()
    matching_routes = []
    for route in ROUTES:
        for stop in route["stops"]:
            if query_stop in stop["name"].lower():
                matching_routes.append(route["id"])
                break
    
    return [b for b in BUSES if b["route_id"] in matching_routes]
